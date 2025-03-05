import UserPaperProgress from '#models/user_paper_progress'
import UserMcqResponse from '#models/user_mcq_response'
import UserSaqResponse from '#models/user_saq_response'
import { DateTime } from 'luxon'
import PastPaper from '#models/past_paper'
import { QuestionType } from '#enums/question_types'
import UserOsceResponse from '#models/user_osce_response'

export default class UserProgressService {
  /**
   * Record user viewing a paper
   */
  async recordPaperView(userId: number, paperId: number) {
    return UserPaperProgress.updateOrCreate({ userId, paperId }, { lastVisitedAt: DateTime.now() })
  }

  /**
   * Record mcq question attempt and update last question
   */
  async recordMcqAttempt(
    userId: number,
    paperId: number,
    questionId: number,
    choiceId: number,
    isCorrect: boolean
  ) {
    // Record the specific response
    await UserMcqResponse.create({
      userId,
      questionId,
      choiceId, // Store the actual choice ID
      selectedOption: '',
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
   * Record user viewing an SAQ part answer
   */
  async recordSaqPartView(userId: number, paperId: number, questionId: number, partId: number) {
    // First check if the user has already viewed this part
    const existingView = await UserSaqResponse.query()
      .where('userId', userId)
      .where('questionId', questionId)
      .where('partId', partId)
      .first()

    // Only create a new view record if it doesn't already exist
    if (!existingView) {
      await UserSaqResponse.create({
        userId,
        questionId,
        partId,
        answerText: 'viewed', // Just recording that it was viewed
      })
    }

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
   * Record user viewing an OSCE station
   */
  async recordOsceStationView(
    userId: number,
    paperId: number,
    questionId: number,
    stationId: number
  ) {
    // First check if the user has already viewed this station
    const existingView = await UserOsceResponse.query()
      .where('userId', userId)
      .where('questionId', questionId)
      .where('stationId', stationId)
      .first()

    // Only create a new view record if it doesn't already exist
    if (!existingView) {
      await UserOsceResponse.create({
        userId,
        questionId,
        stationId,
        action: 'viewed', // Just recording that it was viewed
      })
    }

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
    // Get total questions and parts in the paper
    const paper = await PastPaper.query()
      .where('id', paperId)
      .preload('questions', (query) => {
        query.preload('choices').preload('parts').preload('stations')
      })
      .firstOrFail()

    // Count total items (MCQ questions + SAQ parts)
    let totalItems = 0
    let answeredItems = 0

    for (const question of paper.questions) {
      if (question.type === QuestionType.MCQ) {
        // For MCQs, each question counts as 1 item
        totalItems++

        // Check if user answered this MCQ
        const mcqResponse = await UserMcqResponse.query()
          .where('userId', userId)
          .where('questionId', question.id)
          .first()

        if (mcqResponse) answeredItems++
      } else if (question.type === QuestionType.SAQ) {
        // For SAQs, each part counts as 1 item
        totalItems += question.parts.length

        // Check how many parts user has viewed
        const viewedParts = await UserSaqResponse.query()
          .where('userId', userId)
          .where('questionId', question.id)
          .count('* as total')

        answeredItems += Number(viewedParts[0].$extras.total || 0)
      } else if (question.type === QuestionType.OSCE) {
        // For OSCEs, each station counts as 1 item
        totalItems += question.stations?.length || 0

        // Check how many stations user has viewed
        const viewedStations = await UserOsceResponse.query()
          .where('userId', userId)
          .where('questionId', question.id)
          .count('* as total')

        answeredItems += Number(viewedStations[0].$extras.total || 0)
      }
    }

    // Calculate percentage
    return totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0
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
