<script setup lang="ts">
import { useQuizLeaderboard } from '~/composables/use_quiz_leaderboard'

interface Props {
  eventSlug: string
  quizId: number
  currentUserId?: number
  initialData?: any
}

const props = defineProps<Props>()

const { 
  data: leaderboard, 
  isLoading, 
  error, 
  refetch
} = useQuizLeaderboard(props.eventSlug, props.quizId, props.initialData)

const getMedal = (rank: number) => {
  switch (rank) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return ''
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border shadow-sm">
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">Leaderboard</h2>
      <button 
        @click="refetch()"
        :disabled="isLoading"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <svg v-if="isLoading" class="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Refresh
      </button>
    </div>

    <div v-if="isLoading && !leaderboard" class="px-6 py-12 text-center">
      <div class="animate-spin mx-auto h-8 w-8 text-blue-600 mb-4">
        <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p class="text-gray-500">Loading leaderboard...</p>
    </div>

    <div v-else-if="error" class="px-6 py-12 text-center">
      <div class="text-red-500 mb-4">
        <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-gray-900 font-medium mb-1">Failed to load leaderboard</p>
      <p class="text-gray-500 text-sm">{{ error.message }}</p>
      <button 
        @click="refetch()"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="!leaderboard || leaderboard.length === 0" class="px-6 py-12 text-center">
      <div class="text-gray-400 mb-4">
        <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      </div>
      <p class="text-gray-900 font-medium mb-1">No quiz attempts yet</p>
      <p class="text-gray-500 text-sm">Be the first to take this quiz!</p>
    </div>

    <!-- Shadcn Table: Name and Score only -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="entry in leaderboard" :key="entry.user_id">
            <td class="px-6 py-4 whitespace-nowrap flex items-center">
              <span v-if="getMedal(entry.rank)" class="text-lg mr-2">{{ getMedal(entry.rank) }}</span>
              <span class="text-sm font-medium text-gray-900">{{ entry.user_name }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-medium text-gray-900">{{ Math.round(entry.score) }}%</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
