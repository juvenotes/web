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
  ExternalLink,
  ArrowLeft
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { ref } from 'vue'

// Import dialogs
import CreateQuizDialog from '~/components/dialogs/CreateEventQuizDialog.vue'
import UploadQuizDialog from '~/components/dialogs/UploadEventQuizDialog.vue'
import EditQuizDialog from '~/components/dialogs/EditEventQuizDialog.vue'

defineOptions({ layout: AdminLayout })

interface Props {
  event: EventDto
  quizzes: EventQuizDto[]
}

const props = defineProps<Props>()

// Dialog states
const createQuizOpen = ref(false)
const uploadQuizOpen = ref(false)
const editQuizOpen = ref(false)
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
  <AppHead :title="`${event.title} - Manage Events`" />
  
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
            <ExternalLink class="h-4 w-4" />
            View Public
          </Link>
          <Link 
            :href="`/manage/events/${event.slug}/edit`"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
          >
            <Edit class="h-4 w-4" />
            Edit Event
          </Link>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Event Details -->
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Event Image -->
            <div v-if="event.imageUrl">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Event Image</h4>
              <img
                :src="event.imageUrl"
                :alt="event.title"
                class="w-full h-64 object-cover rounded-lg border"
              />
            </div>

            <!-- Content -->
            <div v-if="event.content">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Content</h4>
              <div class="prose max-w-none text-sm">
                <div v-html="event.content"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quizzes Section -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <BookOpen class="h-5 w-5 text-primary" />
                Event Quizzes ({{ quizzes.length }})
              </div>
              <div class="flex gap-2">
                <Button @click="uploadQuizOpen = true" variant="outline" size="sm">
                  <Upload class="h-4 w-4 mr-2" />
                  Upload Quiz
                </Button>
                <Button @click="createQuizOpen = true" size="sm">
                  <Plus class="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="quizzes.length > 0" class="space-y-4">
              <div
                v-for="quiz in quizzes"
                :key="quiz.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ quiz.title }}</h3>
                    <p v-if="quiz.description" class="text-sm text-gray-600 mb-3">
                      {{ quiz.description }}
                    </p>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span>{{ quiz.mcqs.length }} questions</span>
                      <span>Multiple Choice</span>
                      <span>Created {{ formatDateShort(quiz.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    <Link
                      :href="`/events/${event.slug}/quiz/${quiz.id}`"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink class="h-3 w-3" />
                      Preview
                    </Link>
                    <Button
                      @click="openEditQuiz(quiz)"
                      variant="outline"
                      size="sm"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger as-child>
                        <Button
                          variant="outline"
                          size="sm"
                          class="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash class="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quiz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction as-child>
                            <form method="DELETE" :action="`/manage/events/${event.slug}/quiz/${quiz.id}`">
                              <Button type="submit" variant="destructive">Confirm Delete</Button>
                            </form>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <BookOpen class="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
              <p class="text-gray-500 mb-6">
                Create quizzes to test participant knowledge during or after the event.
              </p>
              <div class="flex justify-center gap-3">
                <Button @click="uploadQuizOpen = true" variant="outline">
                  <Upload class="h-4 w-4 mr-2" />
                  Upload Quiz
                </Button>
                <Button @click="createQuizOpen = true">
                  <Plus class="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Event Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Event Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Date and Time -->
            <div class="flex items-start gap-3">
              <Calendar class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Date & Time</p>
                <p class="text-sm text-gray-600">{{ formatDate(event.startDate) }}</p>
                <p v-if="event.endDate !== event.startDate" class="text-sm text-gray-600">
                  to {{ formatDate(event.endDate) }}
                </p>
              </div>
            </div>

            <Separator />

            <!-- Location -->
            <div class="flex items-start gap-3">
              <MapPin class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Location</p>
                <p v-if="event.isOnline" class="text-sm text-gray-600">Online Event</p>
                <div v-else>
                  <p v-if="event.venue" class="text-sm text-gray-600">{{ event.venue }}</p>
                  <p v-if="event.address" class="text-sm text-gray-600">{{ event.address }}</p>
                </div>
              </div>
            </div>

            <!-- Online Link -->
            <div v-if="event.onlineLink" class="flex items-start gap-3">
              <Globe class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Event Link</p>
                <a
                  :href="event.onlineLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-primary hover:text-primary/80 break-all"
                >
                  {{ event.onlineLink }}
                </a>
              </div>
            </div>

            <Separator />

            <!-- Capacity -->
            <div v-if="event.maxParticipants" class="flex items-start gap-3">
              <Users class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Capacity</p>
                <p class="text-sm text-gray-600">
                  {{ event.currentParticipants }}/{{ event.maxParticipants }} participants
                </p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    class="bg-primary h-2 rounded-full"
                    :style="{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Price -->
            <div v-if="!event.isFree" class="flex items-start gap-3">
              <DollarSign class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Price</p>
                <p class="text-lg font-semibold text-primary">
                  {{ event.currency }} {{ event.price }}
                </p>
              </div>
            </div>

            <!-- Registration Deadline -->
            <div v-if="event.registrationDeadline" class="flex items-start gap-3">
              <Clock class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Registration Deadline</p>
                <p class="text-sm text-gray-600">{{ formatDateShort(event.registrationDeadline) }}</p>
              </div>
            </div>

            <!-- Created By -->
            <div v-if="event.user" class="flex items-start gap-3">
              <Users class="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">Created By</p>
                <p class="text-sm text-gray-600">{{ event.user.firstName }} {{ event.user.lastName }}</p>
                <p class="text-sm text-gray-500">{{ formatDateShort(event.createdAt) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Link
              :href="`/manage/events/${event.slug}/edit`"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Edit class="h-4 w-4" />
              Edit Event
            </Link>

            <Link
              :href="`/events/${event.slug}`"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <ExternalLink class="h-4 w-4" />
              View Public Page
            </Link>

            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button
                  variant="outline"
                  class="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash class="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction as-child>
                    <form method="DELETE" :action="`/manage/events/${event.slug}`">
                      <Button type="submit" variant="destructive">Confirm Delete</Button>
                    </form>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <CreateQuizDialog
    v-model:open="createQuizOpen"
    :event="event"
  />

  <UploadQuizDialog
    v-model:open="uploadQuizOpen"
    :event="event"
  />

  <EditQuizDialog
    v-if="selectedQuiz"
    v-model:open="editQuizOpen"
    :event="event"
    :quiz="selectedQuiz"
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