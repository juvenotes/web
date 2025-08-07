<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Calendar, Plus, Edit, Trash, Eye } from 'lucide-vue-next'
import { ref, reactive } from 'vue'
import { Button } from '~/components/ui/button'
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
import CreateEventDialog from '~/components/dialogs/CreateEventDialog.vue'
import EditEventDialog from '~/components/dialogs/EditEventDialog.vue'
import DeleteEventDialog from '~/components/dialogs/DeleteEventDialog.vue'
import { router } from '@inertiajs/vue3'

defineOptions({ layout: AdminLayout })

interface Props {
  events: EventDto[]
}

const props = defineProps<Props>()

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

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedEvent = ref<EventDto | null>(null)

function openCreateDialog() {
  showCreateDialog.value = true
}
function openEditDialog(event: EventDto) {
  selectedEvent.value = event
  showEditDialog.value = true
}
function openDeleteDialog(event: EventDto) {
  selectedEvent.value = event
  showDeleteDialog.value = true
}

function handleEventCreated() {
  // Refresh the event list, preserving scroll position
  router.reload({ preserveScroll: true })
}

function handleEventUpdated() {
  // Refresh the event list, preserving scroll position
  router.reload({ preserveScroll: true })
}

function handleEventDeleted() {
  // Refresh the event list, preserving scroll position
  router.reload({ preserveScroll: true })
}

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
          <Button @click="openCreateDialog" class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium">
            <Plus class="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
    </div>

    <!-- Events Grid -->
    <div v-if="props.events.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link
        v-for="event in props.events"
        :key="event.id"
        :href="`/manage/events/${event.slug}`"
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

    <!-- Dialogs -->
    <CreateEventDialog :open="showCreateDialog" @update:open="showCreateDialog = $event" @created="handleEventCreated" />
    <EditEventDialog :open="showEditDialog" :event="selectedEvent" @update:open="showEditDialog = $event" @updated="handleEventUpdated" />
    <DeleteEventDialog :open="showDeleteDialog" :event="selectedEvent" @update:open="showDeleteDialog = $event" @deleted="handleEventDeleted" />
  </div>
</template>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>