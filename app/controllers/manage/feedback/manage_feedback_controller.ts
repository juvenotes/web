import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import QuestionFeedback from '#models/question_feedback'
import QuestionFeedbackDto from '#dtos/question_feedback'
import { DateTime } from 'luxon'

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
        .where('isResolved', isResolved)

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

      return inertia.render('manage/feedback/index', {
        feedbackItems: feedbackItems.map((item) => new QuestionFeedbackDto(item)),
        pagination: feedbackItems.getMeta(),
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
}
