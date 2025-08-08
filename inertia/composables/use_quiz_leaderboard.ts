import { ref, computed } from 'vue'
import axios from 'axios'

interface LeaderboardEntry {
  rank: number
  user_id: number
  user_name: string
  score: number
  questions_attempted: number
  questions_correct: number
  completion_percentage: number
  avg_time_per_question: number | null
  created_at: string
  updated_at: string
}

interface LeaderboardData {
  event: {
    id: number
    title: string
    slug: string
  }
  quiz: {
    id: number
    title: string
    slug: string
  }
  leaderboard: LeaderboardEntry[]
  totalParticipants: number
  lastUpdated: string
}

interface UpdateStatsPayload {
  questionsAttempted: number
  questionsCorrect: number
  completionPercentage: number
  score: number
  additionalData?: Record<string, any>
}

export function useQuizLeaderboard(eventSlug: string, quizId: number, initialData?: any) {
  const leaderboardData = ref<LeaderboardData | null>(initialData)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const isUpdatingStats = ref(false)
  const updateStatsError = ref<Error | null>(null)

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get(`/api/events/${eventSlug}/quiz/${quizId}/leaderboard`, {
        headers: {
          Accept: 'application/json',
        },
      })
      leaderboardData.value = response.data
    } catch (err) {
      error.value = err as Error
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Update quiz stats
  const updateStats = async (statsData: UpdateStatsPayload) => {
    isUpdatingStats.value = true
    updateStatsError.value = null

    try {
      const response = await axios.put(`/api/events/${eventSlug}/quiz/${quizId}/stats`, statsData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Refresh leaderboard after successful update
      await fetchLeaderboard()

      return response.data
    } catch (err) {
      updateStatsError.value = err as Error
      console.error('Failed to update quiz stats:', err)
      throw err
    } finally {
      isUpdatingStats.value = false
    }
  }

  // Manual refresh function
  const refetch = () => fetchLeaderboard()

  return {
    data: computed(() => leaderboardData.value?.leaderboard || []),
    leaderboardData: computed(() => leaderboardData.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    refetch,
    updateStats,
    isUpdatingStats: computed(() => isUpdatingStats.value),
    updateStatsError: computed(() => updateStatsError.value),
  }
}
