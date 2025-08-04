<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import DashLayout from '~/layouts/DashLayout.vue'
import { Calendar, MapPin, Users, Settings, Clock } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

defineOptions({ layout: DashLayout })

interface Props {
  events: {
    data: EventDto[]
    meta: {
      currentPage: number
      firstPage: number
      lastPage: number
      perPage: number
      total: number
      hasPages: boolean
      hasMorePages: boolean
    }
  }
  canManage: boolean
  filters: {
    search: string
    eventType: string
    status: string
  }
}

const props = defineProps<Props>()

const searchInput = ref(props.filters.search)
const eventTypeFilter = ref(props.filters.eventType)

const breadcrumbItems = [{ label: 'Events' }]

const eventTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'webinar', label: 'Webinars' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'conference', label: 'Conferences' },
  { value: 'exam', label: 'Exams' },
  { value: 'seminar', label: 'Seminars' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'other', label: 'Other' },
]

const hasEvents = computed(() => props.events.data.length > 0)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getEventTypeColor(type: string) {
  const colors = {
    webinar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    conference: 'bg-purple-100 text-purple-800',
    exam: 'bg-red-100 text-red-800',
    seminar: 'bg-yellow-100 text-yellow-800',
    meeting: 'bg-gray-100 text-gray-800',
    other: 'bg-indigo-100 text-indigo-800',
  }
  return colors[type as keyof typeof colors] || colors.other
}

function getStatusColor(status: string) {
  const colors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  return colors[status as keyof typeof colors] || colors.draft
}
</script>

<template>
  <AppHead title="Events" description="Discover and participate in educational events" />

  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header Section -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />

        <!-- Title and Description -->
        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6"
        >
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <Calendar class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Events</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                Discover and participate in educational events including webinars, workshops, 
                conferences, and exams designed to enhance your medical knowledge and skills.
              </p>
            </div>
          </div>

          <!-- Manage Button -->
          <div class="w-full sm:w-auto flex-shrink-0">
            <Link
              v-if="canManage"
              href="/manage/events"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <!-- Search and Filter Section -->
      <div class="mb-6 space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <Input
              v-model="searchInput"
              placeholder="Search events by title or description..."
              class="w-full"
            />
          </div>
          <div class="w-full sm:w-48">
            <select
              v-model="eventTypeFilter"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#55A9C4] focus:border-transparent"
            >
              <option v-for="option in eventTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <Button
            as="a"
            :href="`/events?search=${searchInput}&eventType=${eventTypeFilter}`"
            class="bg-[#55A9C4] hover:bg-[#4795af]"
          >
            Filter
          </Button>
        </div>
      </div>

      <!-- Results Info -->
      <div class="mb-6">
        <p class="text-sm text-gray-500">
          Showing {{ events.data.length }} of {{ events.meta.total }} events
        </p>
      </div>

      <!-- Events Grid -->
      <div v-if="hasEvents" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="event in events.data"
          :key="event.id"
          class="group hover:shadow-lg transition-all duration-200 overflow-hidden"
        >
          <div v-if="event.imageUrl" class="relative h-48 overflow-hidden">
            <img
              :src="event.imageUrl"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div class="absolute top-3 left-3 flex gap-2">
              <Badge :class="getEventTypeColor(event.eventType)" class="text-xs font-medium">
                {{ event.eventType }}
              </Badge>
              <Badge :class="getStatusColor(event.status)" class="text-xs font-medium">
                {{ event.status }}
              </Badge>
            </div>
          </div>

          <CardHeader class="pb-3">
            <div v-if="!event.imageUrl" class="flex gap-2 mb-3">
              <Badge :class="getEventTypeColor(event.eventType)" class="text-xs font-medium">
                {{ event.eventType }}
              </Badge>
              <Badge :class="getStatusColor(event.status)" class="text-xs font-medium">
                {{ event.status }}
              </Badge>
            </div>

            <CardTitle class="text-lg font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors">
              <Link :href="`/events/${event.slug}`" class="block">
                {{ event.title }}
              </Link>
            </CardTitle>

            <p v-if="event.description" class="text-sm text-gray-600 line-clamp-2 mt-2">
              {{ event.description }}
            </p>
          </CardHeader>

          <CardContent class="pt-0">
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <Clock class="h-4 w-4 text-gray-400" />
                <span>{{ formatDate(event.startDate) }}</span>
              </div>

              <div v-if="event.venue || event.isOnline" class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-gray-400" />
                <span v-if="event.isOnline">Online Event</span>
                <span v-else>{{ event.venue }}</span>
              </div>

              <div v-if="event.maxParticipants" class="flex items-center gap-2">
                <Users class="h-4 w-4 text-gray-400" />
                <span>{{ event.currentParticipants }}/{{ event.maxParticipants }} participants</span>
              </div>

              <div v-if="!event.isFree" class="text-[#55A9C4] font-medium">
                {{ event.currency }} {{ event.price }}
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100">
              <Link
                :href="`/events/${event.slug}`"
                class="inline-flex items-center text-sm font-medium text-[#55A9C4] hover:text-[#4795af] transition-colors"
              >
                View Details
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="h-16 w-16 mx-auto mb-4 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
          <Calendar class="h-8 w-8 text-[#55A9C4]" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No events found</h3>
        <p class="text-gray-500">
          {{ searchInput || eventTypeFilter ? 'Try adjusting your search criteria.' : 'No events are currently available.' }}
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="events.meta.hasPages" class="mt-8 flex justify-center">
        <div class="flex items-center gap-2">
          <Button
            v-if="events.meta.currentPage > 1"
            as="a"
            :href="`/events?page=${events.meta.currentPage - 1}&search=${searchInput}&eventType=${eventTypeFilter}`"
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          <span class="px-4 py-2 text-sm text-gray-600">
            Page {{ events.meta.currentPage }} of {{ events.meta.lastPage }}
          </span>

          <Button
            v-if="events.meta.hasMorePages"
            as="a"
            :href="`/events?page=${events.meta.currentPage + 1}&search=${searchInput}&eventType=${eventTypeFilter}`"
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.header-animation {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>