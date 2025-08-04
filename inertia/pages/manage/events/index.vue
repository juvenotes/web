<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Calendar, Plus, Search, Filter, Edit, Trash2, Eye, Users } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

defineOptions({ layout: AdminLayout })

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
  filters: {
    search: string
    status: string
    eventType: string
  }
}

const props = defineProps<Props>()

const searchInput = ref(props.filters.search)
const statusFilter = ref(props.filters.status)
const eventTypeFilter = ref(props.filters.eventType)

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: string) {
  const colors = {
    published: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return colors[status as keyof typeof colors] || colors.draft
}

function getEventTypeColor(type: string) {
  const colors = {
    webinar: 'bg-blue-50 text-blue-700 border-blue-200',
    workshop: 'bg-green-50 text-green-700 border-green-200',
    conference: 'bg-purple-50 text-purple-700 border-purple-200',
    exam: 'bg-red-50 text-red-700 border-red-200',
    seminar: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    meeting: 'bg-gray-50 text-gray-700 border-gray-200',
    other: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }
  return colors[type as keyof typeof colors] || colors.other
}

const hasEvents = props.events.data.length > 0
</script>

<template>
  <AppHead title="Manage Events" description="Manage educational events and quizzes" />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4 mt-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Calendar class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">Events Management</h1>
            <p class="text-base text-muted-foreground/90 max-w-2xl">
              Create and manage educational events, workshops, webinars, and their associated quizzes
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <Link href="/events" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Eye class="h-4 w-4" />
            View Public
          </Link>
          <Link href="/manage/events/create" class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium">
            <Plus class="h-4 w-4" />
            Create Event
          </Link>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <Calendar class="h-5 w-5 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Events</p>
              <p class="text-2xl font-bold text-gray-900">{{ events.meta.total }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <Users class="h-5 w-5 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Published</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ events.data.filter(e => e.status === 'published').length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <Edit class="h-5 w-5 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Drafts</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ events.data.filter(e => e.status === 'draft').length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <Calendar class="h-5 w-5 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">This Month</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ events.data.filter(e => {
                  const eventDate = new Date(e.startDate)
                  const now = new Date()
                  return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                }).length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                v-model="searchInput"
                placeholder="Search events by title, description..."
                class="pl-10"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:w-auto">
            <select
              v-model="statusFilter"
              class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <select
              v-model="eventTypeFilter"
              class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option v-for="option in eventTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <Button
              as="a"
              :href="`/manage/events?search=${searchInput}&status=${statusFilter}&eventType=${eventTypeFilter}`"
              class="flex items-center gap-2"
            >
              <Filter class="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Events Table -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span>Events ({{ events.data.length }})</span>
          <Link 
            href="/manage/events/create"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
          >
            <Plus class="h-4 w-4" />
            Add Event
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="hasEvents" class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="event in events.data" :key="event.id" class="hover:bg-gray-50">
                <TableCell>
                  <div class="flex items-start gap-3">
                    <div v-if="event.imageUrl" class="flex-shrink-0">
                      <img
                        :src="event.imageUrl"
                        :alt="event.title"
                        class="h-12 w-12 rounded-lg object-cover"
                      />
                    </div>
                    <div v-else class="flex-shrink-0">
                      <div class="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Calendar class="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <Link 
                        :href="`/manage/events/${event.slug}`"
                        class="font-medium text-gray-900 hover:text-primary transition-colors block truncate"
                      >
                        {{ event.title }}
                      </Link>
                      <p v-if="event.description" class="text-sm text-gray-500 truncate mt-1">
                        {{ event.description }}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :class="getEventTypeColor(event.eventType)" class="text-xs">
                    {{ event.eventType }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :class="getStatusColor(event.status)" class="text-xs">
                    {{ event.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">{{ formatDate(event.startDate) }}</div>
                    <div class="text-gray-500">{{ event.isOnline ? 'Online' : event.venue || 'TBD' }}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    <span v-if="event.maxParticipants" class="font-medium">
                      {{ event.currentParticipants }}/{{ event.maxParticipants }}
                    </span>
                    <span v-else class="text-gray-500">Unlimited</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Link
                      :href="`/manage/events/${event.slug}`"
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye class="h-4 w-4" />
                    </Link>
                    <Link
                      :href="`/manage/events/${event.slug}/edit`"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Event"
                    >
                      <Edit class="h-4 w-4" />
                    </Link>
                    <Button
                      as="form"
                      method="DELETE"
                      :href="`/manage/events/${event.slug}`"
                      variant="ghost"
                      size="sm"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Event"
                      @click="return confirm('Are you sure you want to delete this event?')"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <Calendar class="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p class="text-gray-500 mb-6">
            Get started by creating your first event.
          </p>
          <Link
            href="/manage/events/create"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            <Plus class="h-4 w-4" />
            Create Event
          </Link>
        </div>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <div v-if="events.meta.hasPages" class="flex justify-center">
      <div class="flex items-center gap-2">
        <Button
          v-if="events.meta.currentPage > 1"
          as="a"
          :href="`/manage/events?page=${events.meta.currentPage - 1}&search=${searchInput}&status=${statusFilter}&eventType=${eventTypeFilter}`"
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
          :href="`/manage/events?page=${events.meta.currentPage + 1}&search=${searchInput}&status=${statusFilter}&eventType=${eventTypeFilter}`"
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>