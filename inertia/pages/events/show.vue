<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import DashLayout from '~/layouts/DashLayout.vue'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Globe, 
  DollarSign, 
  Tag,
  ExternalLink,
  PlayCircle,
  BookOpen
} from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'

defineOptions({ layout: DashLayout })

interface Props {
  event: EventDto
  quizzes: EventQuizDto[]
  canRegister: boolean
  isRegistered: boolean
}

const props = defineProps<Props>()

const breadcrumbItems = [
  { label: 'Events', href: '/events' },
  { label: props.event.title }
]

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

const isEventCompleted = new Date(props.event.endDate) < new Date()
const isRegistrationOpen = props.event.registrationDeadline 
  ? new Date(props.event.registrationDeadline) > new Date()
  : true
</script>

<template>
  <AppHead 
    :title="event.title" 
    :description="event.description || `Join ${event.title} - ${event.eventType}`" 
  />

  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="mb-6">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Event Header -->
          <Card>
            <CardContent class="p-6">
              <!-- Event Image -->
              <div v-if="event.imageUrl" class="mb-6">
                <img
                  :src="event.imageUrl"
                  :alt="event.title"
                  class="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2 mb-4">
                <Badge :class="getEventTypeColor(event.eventType)" class="text-xs font-medium">
                  {{ event.eventType }}
                </Badge>
                <Badge :class="getStatusColor(event.status)" class="text-xs font-medium">
                  {{ event.status }}
                </Badge>
                <Badge v-if="event.isFree" class="bg-green-100 text-green-800 text-xs font-medium">
                  Free
                </Badge>
              </div>

              <!-- Title and Description -->
              <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ event.title }}</h1>
              
              <p v-if="event.description" class="text-gray-600 text-lg leading-relaxed mb-6">
                {{ event.description }}
              </p>

              <!-- Content -->
              <div v-if="event.content" class="prose max-w-none">
                <div v-html="event.content"></div>
              </div>
            </CardContent>
          </Card>

          <!-- Quizzes Section -->
          <Card v-if="quizzes.length > 0">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BookOpen class="h-5 w-5 text-[#55A9C4]" />
                Event Quizzes
              </CardTitle>
              <p class="text-sm text-gray-600">
                Test your knowledge with these quizzes related to the event.
              </p>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
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
                        <span>{{ quiz.questions?.length || 0 }} questions</span>
                        <span>Multiple Choice</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <Link
                        :href="`/events/${event.slug}/quiz/${quiz.id}`"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-[#55A9C4] hover:bg-[#4795af] text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <PlayCircle class="h-4 w-4" />
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Event Details -->
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
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
              <div v-if="event.onlineLink && isRegistered" class="flex items-start gap-3">
                <ExternalLink class="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Event Link</p>
                  <a
                    :href="event.onlineLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-[#55A9C4] hover:text-[#4795af] break-all"
                  >
                    Join Event
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
                      class="bg-[#55A9C4] h-2 rounded-full"
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
                  <p class="text-lg font-semibold text-[#55A9C4]">
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

              <!-- Organizer -->
              <div v-if="event.user" class="flex items-start gap-3">
                <Tag class="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Organizer</p>
                  <p class="text-sm text-gray-600">{{ event.user.firstName }} {{ event.user.lastName }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Registration Card -->
          <Card v-if="event.status === 'published' && !isEventCompleted">
            <CardContent class="p-6">
              <div v-if="isRegistered" class="text-center">
                <div class="mb-4">
                  <div class="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">You're Registered!</h3>
                <p class="text-sm text-gray-600 mb-4">
                  You'll receive event details and updates via email.
                </p>
              </div>
              
              <div v-else-if="canRegister && isRegistrationOpen" class="text-center">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Register for this Event</h3>
                <Button
                  as="form"
                  method="POST"
                  :href="`/events/${event.slug}/register`"
                  class="w-full bg-[#55A9C4] hover:bg-[#4795af] text-white"
                  size="lg"
                >
                  {{ event.isFree ? 'Register for Free' : `Register for ${event.currency} ${event.price}` }}
                </Button>
              </div>

              <div v-else class="text-center">
                <div class="mb-4">
                  <div class="h-12 w-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock class="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Registration Closed</h3>
                <p class="text-sm text-gray-600">
                  {{ !isRegistrationOpen ? 'Registration deadline has passed.' : 'Event is at capacity.' }}
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Event Completed -->
          <Card v-else-if="isEventCompleted">
            <CardContent class="p-6 text-center">
              <div class="mb-4">
                <div class="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar class="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Event Completed</h3>
              <p class="text-sm text-gray-600">
                This event has already taken place.
              </p>
              <!-- Show quizzes for completed events -->
              <div v-if="quizzes.length > 0" class="mt-4">
                <p class="text-sm text-gray-600 mb-3">
                  You can still take the event quizzes below.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  @apply text-gray-700;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-gray-900;
}

.prose a {
  @apply text-[#55A9C4] hover:text-[#4795af];
}
</style>