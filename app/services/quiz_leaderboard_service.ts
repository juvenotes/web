import UserQuizStat from '#models/user_quiz_stat'
import UserMcqResponse from '#models/user_mcq_response'
import Question from '#models/question'
import { DateTime } from 'luxon'

interface LeaderboardEntry {
  rank: number
  user_id: number
  user_name: string
  score: number
  questions_attempted: number
  questions_correct: number
  completion_percentage: number
  avg_time_per_question: number | null
  created_at: DateTime
  updated_at: DateTime
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  totalParticipants: number
  lastUpdated: string
}

export class QuizLeaderboardService {
  /**
   * Get leaderboard data for a specific quiz using Lucid ORM
   */
  static async getQuizLeaderboard(quizId: number): Promise<LeaderboardResponse> {
    // Get all user quiz stats for this quiz with user information
    const userStats = await UserQuizStat.query()
      .where('quizId', quizId)
      .preload('user', (userQuery) => {
        userQuery.select(['id', 'fullName'])
      })
      .orderBy('score', 'desc')
      .orderBy('completionPercentage', 'desc')
      .orderBy('updatedAt', 'asc') // Earlier completion time is better for tiebreaker

    // Get additional response data for each user to calculate avg time
    const leaderboard: LeaderboardEntry[] = []

    for (const [index, stat] of userStats.entries()) {
      // Get user's responses for this quiz to calculate average time
      const userResponses = await UserMcqResponse.query()
        .where('userId', stat.userId)
        .where('source', 'event_quiz')
        .whereHas('question', (questionQuery) => {
          questionQuery.where('eventQuizId', quizId)
        })
        .preload('question')
        .orderBy('createdAt', 'asc')

      let avgTimePerQuestion: number | null = null

      if (userResponses.length > 1) {
        // Calculate session duration from first to last response
        const firstResponse = userResponses[0]
        const lastResponse = userResponses[userResponses.length - 1]
        const sessionDurationMinutes = lastResponse.createdAt.diff(
          firstResponse.createdAt,
          'minutes'
        ).minutes

        if (sessionDurationMinutes > 0) {
          avgTimePerQuestion = sessionDurationMinutes / userResponses.length
        }
      }

      leaderboard.push({
        rank: index + 1,
        user_id: stat.userId,
        user_name: stat.user?.fullName || 'Unknown User',
        score: stat.score,
        questions_attempted: stat.questionsAttempted,
        questions_correct: stat.questionsCorrect,
        completion_percentage: stat.completionPercentage,
        avg_time_per_question: avgTimePerQuestion,
        created_at: stat.createdAt,
        updated_at: stat.updatedAt,
      })
    }

    return {
      leaderboard,
      totalParticipants: userStats.length,
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Update or create user quiz statistics
   */
  static async updateUserQuizStats(
    userId: number,
    quizId: number,
    data: {
      questionsAttempted: number
      questionsCorrect: number
      completionPercentage: number
      score: number
      additionalData?: any
    }
  ): Promise<UserQuizStat> {
    const userQuizStat = await UserQuizStat.updateOrCreate(
      { userId, quizId },
      {
        questionsAttempted: data.questionsAttempted,
        questionsCorrect: data.questionsCorrect,
        completionPercentage: data.completionPercentage,
        score: data.score,
        additionalData: data.additionalData || {},
      }
    )

    // Preload user data for response
    await userQuizStat.load('user')
    return userQuizStat
  }

  /**
   * Get user's current quiz statistics
   */
  static async getUserQuizStats(userId: number, quizId: number): Promise<UserQuizStat | null> {
    return await UserQuizStat.query()
      .where('userId', userId)
      .where('quizId', quizId)
      .preload('user')
      .first()
  }

  /**
   * Calculate quiz statistics for a user based on their responses
   */
  static async calculateQuizStatsFromResponses(
    userId: number,
    quizId: number
  ): Promise<{
    questionsAttempted: number
    questionsCorrect: number
    completionPercentage: number
    score: number
  }> {
    // Get all questions in this quiz
    const quizQuestions = await Question.query().where('eventQuizId', quizId).select(['id'])

    const totalQuestions = quizQuestions.length

    // Get user's responses for this quiz
    const userResponses = await UserMcqResponse.query()
      .where('userId', userId)
      .where('source', 'event_quiz')
      .whereHas('question', (questionQuery) => {
        questionQuery.where('eventQuizId', quizId)
      })

    const questionsAttempted = userResponses.length
    const questionsCorrect = userResponses.filter((response) => response.isCorrect).length
    const completionPercentage =
      totalQuestions > 0 ? (questionsAttempted / totalQuestions) * 100 : 0
    const score = totalQuestions > 0 ? (questionsCorrect / totalQuestions) * 100 : 0

    return {
      questionsAttempted,
      questionsCorrect,
      completionPercentage,
      score,
    }
  }

  /**
   * Get quiz completion statistics
   */
  static async getQuizCompletionStats(quizId: number): Promise<{
    totalQuestions: number
    totalParticipants: number
    averageScore: number
    averageCompletion: number
  }> {
    // Get quiz questions count
    const totalQuestions = await Question.query()
      .where('eventQuizId', quizId)
      .count('id as total')
      .first()

    // Get stats for all participants
    const participantStats = await UserQuizStat.query().where('quizId', quizId)

    const totalParticipants = participantStats.length
    const averageScore =
      totalParticipants > 0
        ? participantStats.reduce((sum, stat) => sum + stat.score, 0) / totalParticipants
        : 0
    const averageCompletion =
      totalParticipants > 0
        ? participantStats.reduce((sum, stat) => sum + stat.completionPercentage, 0) /
          totalParticipants
        : 0

    return {
      totalQuestions: Number(totalQuestions?.$extras.total || 0),
      totalParticipants,
      averageScore,
      averageCompletion,
    }
  }
}
