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
      <!-- Breadcrumb -->
      <div class="mb-6">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />
      </div>
      <!-- Event Header -->
      <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
          <div class="flex items-start gap-4 mt-4">
            <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Calendar class="h-6 w-6 text-primary" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-foreground">{{ props.event.title }}</h1>
                <Badge :class="getStatusColor(props.event.status)" class="text-xs">
                  {{ props.event.status }}
                </Badge>
                <Badge :class="getEventTypeColor(props.event.eventType)" class="text-xs">
                  {{ props.event.eventType }}
                </Badge>
              </div>
              <p v-if="props.event.description" class="text-base text-muted-foreground/90 max-w-2xl">
                {{ props.event.description }}
              </p>
              <div class="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <span>
                  <strong>Start:</strong> {{ formatDate(props.event.startDate) }}
                </span>
                <span>
                  <strong>End:</strong> {{ formatDate(props.event.endDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quizzes List -->
      <div v-if="props.quizzes.length" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="quiz in props.quizzes"
            :key="quiz.id"
            :href="`/events/${props.event.slug}/quiz/${quiz.id}`"
            class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div class="relative space-y-3">
              <h3 class="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {{ quiz.title }}
              </h3>
              <div class="flex items-center gap-3 text-sm mb-2">
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
            <p class="text-muted-foreground">This event does not have any quizzes yet.</p>
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