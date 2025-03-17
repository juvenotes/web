import UserPaperProgress from '#models/user_paper_progress'
import UserMcqResponse from '#models/user_mcq_response'
import UserSaqResponse from '#models/user_saq_response'
import { DateTime } from 'luxon'
import PastPaper from '#models/past_paper'
import { QuestionType } from '#enums/question_types'
import UserOsceResponse from '#models/user_osce_response'
import { ResponseStatus } from '#enums/response_status'
import McqChoice from '#models/mcq_choice'
import SaqPart from '#models/saq_part'
import db from '@adonisjs/lucid/services/db'
import Station from '#models/station'
import UserSpotResponse from '#models/user_spot_response'
import SpotStation from '#models/spot_station'

export default class UserProgressService {
  /**
   * Record user viewing a paper
   */
  async recordPaperView(userId: number, paperId: number) {
    return UserPaperProgress.updateOrCreate({ userId, paperId }, { lastVisitedAt: DateTime.now() })
  }

  /**
   * Record mcq question attempt and update last question
   * @param source Indicates where the response came from ('paper' or 'today')
   */
  async recordMcqAttempt(
    userId: number,
    paperId: number,
    questionId: number,
    choiceId: number,
    isCorrect: boolean,
    source: 'paper' | 'today' = 'paper'
  ) {
    // Get the choice to store its text for historical record
    const choice = await McqChoice.findOrFail(choiceId)

    // Always record in user_mcq_responses table with source field
    await UserMcqResponse.create({
      userId,
      questionId,
      choiceId,
      selectedOption: '',
      isCorrect,
      status: ResponseStatus.ACTIVE,
      originalChoiceText: choice.choiceText,
      source,
    })

    // Based on source, update different stat tables
    if (source === 'today') {
      // Track Today question attempt in user_today_stats
      await this.recordTodayQuestionAttempt(userId, paperId, questionId, isCorrect)
    } else {
      // Track Paper question attempt in user_paper_stats
      await this.recordPaperQuestionAttempt(userId, paperId, questionId, isCorrect)

      // Also update UserPaperProgress (keep existing functionality)
      const existingProgress = await UserPaperProgress.query()
        .where('user_id', userId)
        .where('paper_id', paperId)
        .first()

      if (existingProgress) {
        await existingProgress
          .merge({
            lastQuestionId: questionId,
            lastVisitedAt: DateTime.now(),
            attemptCount: existingProgress.attemptCount + 1,
          })
          .save()
      } else {
        await UserPaperProgress.create({
          userId,
          paperId,
          lastQuestionId: questionId,
          lastVisitedAt: DateTime.now(),
          attemptCount: 1,
        })
      }
    }
  }

  /**
   * Record a Today question attempt
   */
  private async recordTodayQuestionAttempt(
    userId: number,
    todayId: number,
    _questionId: number,
    isCorrect: boolean
  ) {
    const today = new Date().toISOString().split('T')[0]

    await db.transaction(async (trx) => {
      // Check if record exists
      const existing = await trx
        .from('user_today_stats')
        .where('user_id', userId)
        .where('date', today)
        .first()

      if (existing) {
        // Update existing record
        await trx
          .from('user_today_stats')
          .where('user_id', userId)
          .where('date', today)
          .update({
            questions_attempted: existing.questions_attempted + 1,
            questions_correct: existing.questions_correct + (isCorrect ? 1 : 0),
          })
      } else {
        // Insert new record - CHANGED THIS PART
        await trx
          .insertQuery()
          .table('user_today_stats')
          .insert({
            user_id: userId,
            date: today,
            questions_attempted: 1,
            questions_correct: isCorrect ? 1 : 0,
            today_id: todayId,
          })
      }
    })
  }

  /**
   * Record a Paper question attempt with aggregated stats
   */
  private async recordPaperQuestionAttempt(
    userId: number,
    paperId: number,
    _questionId: number,
    isCorrect: boolean
  ) {
    // Calculate current completion percentage
    const completionPercentage = await this.getCompletionPercentage(userId, paperId)

    await db.transaction(async (trx) => {
      // Check if record exists
      const existing = await trx
        .from('user_paper_stats')
        .where('user_id', userId)
        .where('paper_id', paperId)
        .first()

      if (existing) {
        // Update existing record
        await trx
          .from('user_paper_stats')
          .where('user_id', userId)
          .where('paper_id', paperId)
          .update({
            questions_attempted: existing.questions_attempted + 1,
            questions_correct: existing.questions_correct + (isCorrect ? 1 : 0),
            completion_percentage: completionPercentage,
          })
      } else {
        // Insert new record - CHANGED THIS PART
        await trx
          .insertQuery()
          .table('user_paper_stats')
          .insert({
            user_id: userId,
            paper_id: paperId,
            questions_attempted: 1,
            questions_correct: isCorrect ? 1 : 0,
            completion_percentage: completionPercentage,
          })
      }
    })
  }

  /**
   * Record user viewing an SAQ part answer
   */
  async recordSaqPartView(userId: number, paperId: number, questionId: number, partId: number) {
    // Get the part to store its text for historical record
    const part = await SaqPart.findOrFail(partId)

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
        status: ResponseStatus.ACTIVE, // Add the status enum
        originalPartText: part.partText, // Store current text for historical reference
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
    const station = await Station.findOrFail(stationId)
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
        status: ResponseStatus.ACTIVE,
        originalStationText: station.partText, // Store text for historical reference
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
   * Record user viewing a SPOT station
   */
  async recordSpotStationView(
    userId: number,
    paperId: number,
    questionId: number,
    stationId: number
  ) {
    const station = await SpotStation.findOrFail(stationId)

    // First check if the user has already viewed this station
    const existingView = await UserSpotResponse.query()
      .where('userId', userId)
      .where('questionId', questionId)
      .where('stationId', stationId)
      .first()

    // Only create a new view record if it doesn't already exist
    if (!existingView) {
      await UserSpotResponse.create({
        userId,
        questionId,
        stationId,
        action: 'viewed', // Just recording that it was viewed
        status: ResponseStatus.ACTIVE,
        originalStationText: station.partText, // Store text for historical reference
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
        query
          .preload('choices')
          .preload('parts')
          .preload('stations', (stationQuery) => {
            // Only include non-deleted stations
            stationQuery.whereNull('deleted_at')
          })
          .preload('spotStations', (stationQuery) => {
            // Only include non-deleted stations
            stationQuery.whereNull('deleted_at')
          })
      })
      .firstOrFail()

    // Count total items (MCQ questions + SAQ parts + OSCE stations)
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
          .where('status', ResponseStatus.ACTIVE)
          .count('* as total')

        answeredItems += Number(viewedStations[0].$extras.total || 0)
      } else if (question.type === QuestionType.SPOT) {
        // For SPOTs, each station counts as 1 item
        totalItems += question.spotStations?.length || 0

        // Check how many stations user has viewed
        const viewedStations = await UserSpotResponse.query()
          .where('userId', userId)
          .where('questionId', question.id)
          .where('status', ResponseStatus.ACTIVE)
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
