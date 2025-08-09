<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { 
  Calendar, 
  Edit, 
  Trash, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign,
  Globe,
  BookOpen,
  Upload,
  Eye,
  ArrowLeft
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'

// Import dialogs
import CreateQuizDialog from '~/components/dialogs/CreateEventQuizDialog.vue'
import EditQuizDialog from '~/components/dialogs/EditEventQuizDialog.vue'
import EditEventDialog from '~/components/dialogs/EditEventDialog.vue'

defineOptions({ layout: AdminLayout })

interface Props {
  event: EventDto
  quizzes: EventQuizDto[]
}

const props = defineProps<Props>()

// Dialog states
const createQuizOpen = ref(false)
const editQuizOpen = ref(false)
const editEventOpen = ref(false)
const selectedQuiz = ref<EventQuizDto | null>(null)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

function openEditQuiz(quiz: EventQuizDto) {
  selectedQuiz.value = quiz
  editQuizOpen.value = true
}

const isEventCompleted = new Date(props.event.endDate) < new Date()

function onDeleteQuiz(e: Event) {
  if (!confirm('Are you sure you want to delete this quiz?')) {
    e.preventDefault()
  }
}

function onDeleteEvent(e: Event) {
  if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    e.preventDefault()
  }
}
</script>

<template>
  <AppHead 
    :title="`${event.title} - Manage Events`" 
    :description="`Manage quizzes and settings for ${event.title} event`"
  />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      
      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4 mt-4">
          <Link 
            href="/manage/events"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </Link>
          
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Calendar class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-foreground">{{ event.title }}</h1>
              <Badge :class="getStatusColor(event.status)" class="text-xs">
                {{ event.status }}
              </Badge>
              <Badge :class="getEventTypeColor(event.eventType)" class="text-xs">
                {{ event.eventType }}
              </Badge>
            </div>
            <p v-if="event.description" class="text-base text-muted-foreground/90 max-w-2xl">
              {{ event.description }}
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <Link 
            :href="`/events/${event.slug}`" 
            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Eye class="h-4 w-4" />
            View
          </Link>
          <Button 
            @click="editEventOpen = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
          >
            <Edit class="h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mb-6">
      <Button @click="createQuizOpen = true" class="flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Add Quiz
      </Button>
    </div>

    <!-- Quizzes List -->
    <div v-if="quizzes.length" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="quiz in quizzes"
          :key="quiz.id"
          :href="`/manage/events/${event.slug}/quiz/${quiz.id}`"
          class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div class="relative space-y-3">
            <div class="flex items-start justify-between">
              <h3 class="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {{ quiz.title }}
              </h3>
            </div>
            
            <div class="flex items-center gap-3 text-sm">
              <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                {{ quiz.questions?.length ?? 0 }} questions
              </span>
              <span class="text-muted-foreground">
                {{ formatDateShort(quiz.createdAt) }}
              </span>
            </div>
            
            <p v-if="quiz.description" class="text-sm text-muted-foreground line-clamp-2">
              {{ quiz.description }}
            </p>
          </div>
        </Link>
      </div>
    </div>    
    
    <!-- Empty State -->
    <div v-else class="text-center p-8 bg-white rounded-2xl border border-slate-100">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 rounded-full bg-muted/20">
          <BookOpen class="h-8 w-8 text-muted-foreground" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">No quizzes available</h3>
          <p class="text-muted-foreground">Get started by adding your first quiz to this event.</p>
        </div>
        <div class="flex gap-3">
          <Button @click="createQuizOpen = true" class="flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Add Quiz
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <CreateQuizDialog
    v-model:open="createQuizOpen"
    :event="event"
  />

  <EditQuizDialog
    v-if="selectedQuiz"
    v-model:open="editQuizOpen"
    :event="event"
    :quiz="selectedQuiz"
  />

  <EditEventDialog
    v-model:open="editEventOpen"
    :event="event"
  />
</template>

<style scoped>
.prose {
  @apply text-gray-700;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-gray-900;
}

.prose a {
  @apply text-primary hover:text-primary/80;
}
</style>