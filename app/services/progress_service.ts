import UserPaperProgress from '#models/user_paper_progress'
import UserMcqResponse from '#models/user_mcq_response'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class UserProgressService {
  /**
   * Record user viewing a paper
   */
  async recordPaperView(userId: number, paperId: number) {
    return UserPaperProgress.updateOrCreate({ userId, paperId }, { lastVisitedAt: DateTime.now() })
  }

  /**
   * Record question attempt and update last question
   */
  async recordQuestionAttempt(
    userId: number,
    paperId: number,
    questionId: number,
    selectedOption: string,
    isCorrect: boolean
  ) {
    // Record the specific response
    await UserMcqResponse.create({
      userId,
      questionId,
      selectedOption,
      isCorrect,
    })

    // Find existing progress record
    const existingProgress = await UserPaperProgress.query()
      .where('user_id', userId)
      .where('paper_id', paperId)
      .first()

    if (existingProgress) {
      // If record exists, update it and increment attempt count
      await existingProgress
        .merge({
          lastQuestionId: questionId,
          lastVisitedAt: DateTime.now(),
          attemptCount: existingProgress.attemptCount + 1,
        })
        .save()
    } else {
      // If no record exists, create a new one with attempt_count = 1
      await UserPaperProgress.create({
        userId,
        paperId,
        lastQuestionId: questionId,
        lastVisitedAt: DateTime.now(),
        attemptCount: 1,
      })
    }
  }

  /**
   * Get user completion percentage for a paper
   */
  async getCompletionPercentage(userId: number, paperId: number) {
    try {
      // Get total questions in paper
      const paperQuestionsCount = await db
        .from('questions')
        .where('past_paper_id', paperId)
        .count('* as total')

      // More defensive approach to get the count value
      const totalQuestions = Number(
        paperQuestionsCount[0]?.total || paperQuestionsCount[0]?.$extras?.total || 0
      )

      if (totalQuestions === 0) return 0

      // Get count of unique questions user has answered for this paper
      const answeredQuestionsCount = await db
        .from('user_mcq_responses as umr')
        .join('questions as q', 'umr.question_id', 'q.id')
        .where('q.past_paper_id', paperId)
        .where('umr.user_id', userId)
        .countDistinct('umr.question_id as answered')

      // More defensive approach for this result as well
      const answeredQuestions = Number(
        answeredQuestionsCount[0]?.answered || answeredQuestionsCount[0]?.$extras?.answered || 0
      )

      // Calculate percentage
      return Math.round((answeredQuestions / totalQuestions) * 100)
    } catch (error) {
      console.error('Error calculating completion percentage:', error)
      return 0 // Return 0% if there was an error
    }
  }

  /**
   * Get user's progress for a specific paper
   */
  async getPaperProgress(userId: number, paperId: number) {
    return UserPaperProgress.query()
      .where('userId', userId)
      .where('paperId', paperId)
      .preload('lastQuestion')
      .first()
  }

  /**
   * Get most attempted questions across all users
   */
  async getMostAttemptedQuestions(limit = 10) {
    return UserMcqResponse.query()
      .groupBy('questionId')
      .select('questionId')
      .count('* as attempts')
      .orderBy('attempts', 'desc')
      .preload('question')
      .limit(limit)
  }
}
