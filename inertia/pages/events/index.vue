<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import DashLayout from '~/layouts/DashLayout.vue'
import { Calendar, MapPin, Users, Settings, Clock } from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

defineOptions({ layout: DashLayout })

interface Props {
  events: EventDto[]
  canManage: boolean
}

const props = defineProps<Props>()

const breadcrumbItems = [{ label: 'Events' }]

const hasEvents = props.events.length > 0

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
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <Calendar class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Events</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                Discover and participate in educational events including webinars, workshops, conferences, and exams designed to enhance your medical knowledge and skills.
              </p>
            </div>
          </div>
        </div>
        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <!-- Events Grid -->
      <div v-if="props.events.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          v-for="event in props.events"
          :key="event.id"
          :href="`/events/${event.slug}`"
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 border border-slate-100 dark:border-border hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
          <div class="relative space-y-3">
            <h2 class="text-lg font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300">
              {{ event.title }}
            </h2>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                {{ event.status }}
              </span>
              <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                {{ event.eventType }}
              </span>
            </div>
            <div class="text-sm text-muted-foreground">
              {{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}
            </div>
          </div>
        </Link>
      </div>
      <div v-else class="text-center text-muted-foreground py-12">No events found.</div>
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