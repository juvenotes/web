<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import DashLayout from '~/layouts/DashLayout.vue'
import { Calendar, BookOpen } from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

defineOptions({ layout: DashLayout })

interface Props {
  event: EventDto
  quizzes: EventQuizDto[]
  canManage?: boolean // Add canManage prop (optional)
}

const props = defineProps<Props>()

const breadcrumbItems = [{ label: 'Events', href: '/events' }, { label: props.event.title }]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
</script>

<template>
  <AppHead
    :title="props.event.title"
    :description="props.event.description || `Join ${props.event.title} - ${props.event.eventType}`"
  />

  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <!-- Event Header -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />
        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6"
        >
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div
                class="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center"
              >
                <Calendar class="h-4 w-4 sm:h-6 sm:w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {{ props.event.title }}
              </h1>
              <p
                v-if="props.event.description"
                class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed mb-2 sm:mb-0"
              >
                {{ props.event.description }}
              </p>
              <div
                class="flex flex-col sm:flex-wrap sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground mt-2"
              >
                <span class="text-xs sm:text-sm">
                  <strong>Starts:</strong> {{ formatDate(props.event.startDate) }}
                </span>
                <span class="text-xs sm:text-sm">
                  <strong>Ends:</strong> {{ formatDate(props.event.endDate) }}
                </span>
              </div>
            </div>
          </div>
          <!-- Manage Button -->
          <div class="w-full sm:w-auto flex-shrink-0 flex flex-col gap-2">
            <Link
              v-if="props.canManage"
              :href="`/manage/events/${props.event.slug}`"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span>Manage Event</span>
            </Link>
          </div>
        </div>
        <div
          class="w-8 sm:w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"
        ></div>
      </div>

      <!-- Quizzes List -->
      <div v-if="props.quizzes.length" class="space-y-4">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="quiz in props.quizzes"
            :key="quiz.id"
            :href="`/events/${props.event.slug}/quiz/${quiz.id}`"
            class="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div class="relative space-y-3">
              <h3
                class="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors"
              >
                {{ quiz.title }}
              </h3>
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm mb-2">
                <span
                  class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium text-xs sm:text-sm w-fit"
                >
                  {{ quiz.questions?.length ?? 0 }} questions
                </span>
                <span class="text-muted-foreground text-xs sm:text-sm">
                  {{ formatDateShort(quiz.createdAt) }}
                </span>
              </div>
              <p
                v-if="quiz.description"
                class="text-xs sm:text-sm text-muted-foreground line-clamp-2"
              >
                {{ quiz.description }}
              </p>
            </div>
          </Link>
        </div>
      </div>
      <!-- Empty State -->
      <div v-else class="text-center p-6 sm:p-8 bg-white rounded-2xl border border-slate-100">
        <div class="flex flex-col items-center gap-3 sm:gap-4">
          <div class="p-3 sm:p-4 rounded-full bg-muted/20">
            <BookOpen class="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <div class="space-y-1 sm:space-y-2">
            <h3 class="text-base sm:text-lg font-semibold text-foreground">No quizzes available</h3>
            <p class="text-sm sm:text-base text-muted-foreground">
              This event does not have any quizzes yet.
            </p>
          </div>
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
</style>
