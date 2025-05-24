import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import QuestionFeedback from '#models/question_feedback'
import QuestionFeedbackDto from '#dtos/question_feedback'
import { DateTime } from 'luxon'
import Question from '#models/question'
import QuestionDto from '#dtos/question'
import McqChoice from '#models/mcq_choice'
import SaqPart from '#models/saq_part'
import Station from '#models/station'
import SpotStation from '#models/spot_station'
import transmit from '@adonisjs/transmit/services/main'
import User from '#models/user'

@inject()
export default class ManageFeedbackController {
  async index({ request, inertia, auth, logger }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 20
    const isResolved = request.input('isResolved') === 'true'
    const target = request.input('target')
    const questionId = request.input('questionId')

    // Create context object for logging
    const context = {
      controller: 'ManageFeedbackController',
      action: 'index',
      userId: auth.user?.id,
      filters: { isResolved, target, questionId, page, limit },
    }

    logger.info({ ...context, message: 'Fetching feedback items' })

    try {
      const query = QuestionFeedback.query()
        .preload('user')
        .preload('question', (questionQuery) => {
          questionQuery.preload('pastPaper', (paperQuery) => {
            paperQuery.preload('concept')
          })
        })

      // Only filter by isResolved if the filter is explicitly set
      if (typeof isResolved === 'boolean' && request.input('isResolved') !== undefined) {
        query.where('isResolved', isResolved)
      }

      if (target) {
        query.where('feedbackTarget', target)
      }

      if (questionId) {
        query.where('questionId', questionId)
      }

      const feedbackItems = await query.orderBy('createdAt', 'desc').paginate(page, limit)

      logger.info({
        ...context,
        count: feedbackItems.length,
        message: 'Successfully retrieved feedback items',
      })

      // Always pass a plain array for feedbackItems
      const meta = {
        current_page: feedbackItems.currentPage,
        last_page: feedbackItems.lastPage,
        first_page: feedbackItems.firstPage,
        per_page: feedbackItems.perPage,
      }
      return inertia.render('manage/feedback/index', {
        feedbackItems: feedbackItems.all().map((item) => new QuestionFeedbackDto(item)),
        totalFeedback: feedbackItems.total,
        meta,
        filters: {
          isResolved,
          target,
          questionId,
        },
      })
    } catch (error) {
      logger.error({
        ...context,
        error,
        message: 'Failed to retrieve feedback items',
      })

      throw error
    }
  }

  /**
   * Show a single question (by slug) with all related feedback
   */
  async showQuestion({ params, inertia, logger, auth }: HttpContext) {
    const { slug } = params
    const context = {
      controller: 'ManageFeedbackController',
      action: 'showQuestion',
      slug,
      userId: auth.user?.id,
    }
    logger.info({ ...context, message: 'Fetching question and feedback' })
    try {
      const question = await Question.query()
        .where('slug', slug)
        .preload('pastPaper', (paperQuery: any) => {
          paperQuery.preload('concept')
        })
        .preload('choices')
        .preload('parts')
        .preload('stations')
        .preload('spotStations')
        .firstOrFail()

      const feedbackItems = await QuestionFeedback.query()
        .where('questionId', question.id)
        .preload('user')
        .orderBy('createdAt', 'desc')

      return inertia.render('manage/feedback/show', {
        question: new QuestionDto(question),
        feedbackItems: feedbackItems.map((item: any) => new QuestionFeedbackDto(item)),
      })
    } catch (error) {
      logger.error({ ...context, error, message: 'Failed to fetch question or feedback' })
      throw error
    }
  }

  async markAsResolved({ params, response, auth, logger }: HttpContext) {
    const { id } = params
    const context = {
      controller: 'ManageFeedbackController',
      action: 'markAsResolved',
      feedbackId: id,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Attempting to mark feedback as resolved' })

    try {
      const feedback = await QuestionFeedback.findOrFail(id)

      feedback.isResolved = true
      feedback.resolvedAt = DateTime.now()
      feedback.resolvedBy = auth.user!.id

      await feedback.save()

      // Broadcast notification to feedback creator
      const feedbackUser = await User.find(feedback.userId)
      const question = await Question.find(feedback.questionId)
      if (feedbackUser && question) {
        transmit.broadcast(`users/${feedbackUser.id}`, {
          type: 'feedback_resolved',
          question: {
            id: question.id,
            title: question.questionText,
            slug: question.slug,
          },
          message: `Your feedback to question "${question.questionText}" has been resolved.`,
        })
      }

      logger.info({
        ...context,
        questionId: feedback.questionId,
        message: 'Feedback marked as resolved successfully',
      })

      // Return JSON response
      return response.status(200).json({
        success: true,
        message: 'Feedback marked as resolved',
        feedback: new QuestionFeedbackDto(feedback),
      })
    } catch (error) {
      logger.error({
        ...context,
        error,
        message: 'Failed to mark feedback as resolved',
      })

      return response.status(400).json({
        success: false,
        message: 'Failed to update feedback status',
      })
    }
  }

  /**
   * Update MCQ Choice
   */
  async updateMcqChoice({ params, request, response, auth, logger }: HttpContext) {
    const { id } = params
    const data = request.only(['choiceText', 'explanation', 'isCorrect'])
    try {
      const choice = await McqChoice.findOrFail(id)
      choice.merge(data)
      await choice.save()
      logger.info({
        controller: 'ManageFeedbackController',
        action: 'updateMcqChoice',
        id,
        userId: auth.user?.id,
      })
      return response.ok({ success: true, choice })
    } catch (error: any) {
      logger.error({
        controller: 'ManageFeedbackController',
        action: 'updateMcqChoice',
        id,
        error,
      })
      return response.badRequest({ success: false, error: error.message })
    }
  }

  /**
   * Update SAQ Part
   */
  async updateSaqPart({ params, request, response, auth, logger }: HttpContext) {
    const { id } = params
    const data = request.only(['partText'])
    try {
      const part = await SaqPart.findOrFail(id)
      part.merge(data)
      await part.save()
      logger.info({
        controller: 'ManageFeedbackController',
        action: 'updateSaqPart',
        id,
        userId: auth.user?.id,
      })
      return response.ok({ success: true, part })
    } catch (error: any) {
      logger.error({
        controller: 'ManageFeedbackController',
        action: 'updateSaqPart',
        id,
        error,
      })
      return response.badRequest({ success: false, error: error.message })
    }
  }

  /**
   * Update OSCE Station
   */
  async updateOsceStation({ params, request, response, auth, logger }: HttpContext) {
    const { id } = params
    const data = request.only(['partText', 'expectedAnswer', 'marks'])
    try {
      const station = await Station.findOrFail(id)
      station.merge(data)
      await station.save()
      logger.info({
        controller: 'ManageFeedbackController',
        action: 'updateOsceStation',
        id,
        userId: auth.user?.id,
      })
      return response.ok({ success: true, station })
    } catch (error: any) {
      logger.error({
        controller: 'ManageFeedbackController',
        action: 'updateOsceStation',
        id,
        error,
      })
      return response.badRequest({ success: false, error: error.message })
    }
  }

  /**
   * Update Spot Station
   */
  async updateSpotStation({ params, request, response, auth, logger }: HttpContext) {
    const { id } = params
    const data = request.only(['partText', 'expectedAnswer', 'marks'])
    try {
      const spot = await SpotStation.findOrFail(id)
      spot.merge(data)
      await spot.save()
      logger.info({
        controller: 'ManageFeedbackController',
        action: 'updateSpotStation',
        id,
        userId: auth.user?.id,
      })
      return response.ok({ success: true, spot })
    } catch (error: any) {
      logger.error({
        controller: 'ManageFeedbackController',
        action: 'updateSpotStation',
        id,
        error,
      })
      return response.badRequest({ success: false, error: error.message })
    }
  }

  /**
   * Update Question Stem
   */
  async updateQuestionStem({ params, request, response, auth, logger }: HttpContext) {
    const { id } = params
    const data = request.only(['questionText'])
    try {
      const question = await Question.findOrFail(id)
      question.questionText = data.questionText
      await question.save()
      logger.info({
        controller: 'ManageFeedbackController',
        action: 'updateQuestionStem',
        id,
        userId: auth.user?.id,
      })
      return response.ok({ success: true, question })
    } catch (error: any) {
      logger.error({
        controller: 'ManageFeedbackController',
        action: 'updateQuestionStem',
        id,
        error,
      })
      return response.badRequest({ success: false, error: error.message })
    }
  }
}
