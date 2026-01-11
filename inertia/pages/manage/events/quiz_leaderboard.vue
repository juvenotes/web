<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3'
import AdminLayout from '~/layouts/AdminLayout.vue'
import QuizLeaderboard from '~/components/quiz_leaderboard.vue'
import type { EventDto } from '#dtos/event'
import type { EventQuizDto } from '#dtos/event_quiz'

defineOptions({ layout: AdminLayout })

interface Props {
  event: EventDto
  quiz: EventQuizDto
  leaderboardData: any // Initial server-side data
}

const props = defineProps<Props>()

// Get current user from page props or auth
const page = usePage()
const currentUser = page.props.auth?.user
</script>

<template>
  <Head :title="`${quiz.title} - Leaderboard`" />

  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ quiz.title }}</h1>
          <p class="text-gray-600 mt-1">Live leaderboard for {{ event.title }}</p>
        </div>

        <div class="flex items-center gap-4">
          <Link
            :href="`/manage/events/${event.slug}/quiz/${quiz.id}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Quiz
          </Link>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Quiz Info Card -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div class="p-4 border-b bg-gray-50/50">
            <h3 class="font-semibold text-gray-900">Quiz Details</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Event</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900">{{ event.title }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900">{{ quiz.title }}</dd>
            </div>

            <div v-if="quiz.description">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </dt>
              <dd class="mt-1 text-sm text-gray-900">{{ quiz.description }}</dd>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </dt>
                <dd class="mt-1 text-2xl font-bold text-gray-900">
                  {{ quiz.questions?.length || 0 }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">
                  {{ new Date(quiz.createdAt).toLocaleDateString() }}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div class="lg:col-span-3">
        <QuizLeaderboard
          :event-slug="event.slug"
          :quiz-id="quiz.id"
          :current-user-id="currentUser?.id"
          :initial-data="leaderboardData"
        />
      </div>
    </div>
  </div>
</template>
