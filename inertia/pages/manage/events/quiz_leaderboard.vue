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
      <!-- Quiz Info -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl border shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Quiz Details</h3>
          
          <div class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Event</dt>
              <dd class="text-sm text-gray-900">{{ event.title }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Quiz Title</dt>
              <dd class="text-sm text-gray-900">{{ quiz.title }}</dd>
            </div>
            
            <div v-if="quiz.description">
              <dt class="text-sm font-medium text-gray-500">Description</dt>
              <dd class="text-sm text-gray-900">{{ quiz.description }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Total Questions</dt>
              <dd class="text-sm text-gray-900">{{ quiz.questions?.length || 0 }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Created</dt>
              <dd class="text-sm text-gray-900">
                {{ new Date(quiz.createdAt).toLocaleDateString() }}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
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
