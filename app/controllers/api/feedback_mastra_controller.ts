import type { HttpContext } from '@adonisjs/core/http'
import mastraService from '#services/mastra_service'
import QuestionFeedback from '#models/question_feedback'
import vine from '@vinejs/vine'

export default class FeedbackMastraController {
  /**
   * Get all unresolved feedback items
   */
  async index({ response }: HttpContext) {
    try {
      const feedback = await mastraService.getUnresolvedFeedback()
      return response.json({
        success: true,
        data: feedback,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to fetch feedback',
        details: error.message,
      })
    }
  }

  /**
   * Get feedback statistics
   */
  async stats({ response }: HttpContext) {
    try {
      const stats = await mastraService.getFeedbackStats()
      return response.json({
        success: true,
        data: stats,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to fetch feedback stats',
        details: error.message,
      })
    }
  }

  /**
   * Process feedback and get AI-generated resolution suggestions
   */
  async process({ params, response }: HttpContext) {
    try {
      const feedbackId = params.id
      const result = await mastraService.processFeedback(feedbackId)

      if (!result.success) {
        return response.status(400).json(result)
      }

      return response.json(result)
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to process feedback',
        details: error.message,
      })
    }
  }

  /**
   * Resolve feedback with optional custom resolution
   */
  async resolve({ params, request, response, auth }: HttpContext) {
    try {
      // Validate request body
      const validator = vine.compile(
        vine.object({
          resolution: vine.string().optional(),
        })
      )

      const payload = await request.validateUsing(validator)
      const feedbackId = params.id
      const userId = auth.user?.id

      if (!userId) {
        return response.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      const result = await mastraService.resolveFeedback(feedbackId, userId, payload.resolution)

      if (!result.success) {
        return response.status(400).json(result)
      }

      return response.json(result)
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to resolve feedback',
        details: error.message,
      })
    }
  }

  /**
   * Get specific feedback details
   */
  async show({ params, response }: HttpContext) {
    try {
      const feedbackId = params.id

      const feedback = await QuestionFeedback.query()
        .where('id', feedbackId)
        .preload('question')
        .preload('user')
        .first()

      if (!feedback) {
        return response.status(404).json({
          success: false,
          error: 'Feedback not found',
        })
      }

      return response.json({
        success: true,
        data: feedback,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to fetch feedback',
        details: error.message,
      })
    }
  }

  /**
   * Bulk process multiple feedback items
   */
  async bulkProcess({ request, response, auth }: HttpContext) {
    try {
      const validator = vine.compile(
        vine.object({
          feedbackIds: vine.array(vine.number()),
        })
      )

      const payload = await request.validateUsing(validator)
      const userId = auth.user?.id

      if (!userId) {
        return response.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      const results = []

      for (const feedbackId of payload.feedbackIds) {
        try {
          const result = await mastraService.processFeedback(feedbackId)
          results.push({
            feedbackId,
            ...result,
          })
        } catch (error: any) {
          results.push({
            feedbackId,
            success: false,
            error: error.message,
          })
        }
      }

      return response.json({
        success: true,
        data: results,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to bulk process feedback',
        details: error.message,
      })
    }
  }

  /**
   * Bulk resolve multiple feedback items
   */
  async bulkResolve({ request, response, auth }: HttpContext) {
    try {
      const validator = vine.compile(
        vine.object({
          feedbackIds: vine.array(vine.number()),
          resolution: vine.string().optional(),
        })
      )

      const payload = await request.validateUsing(validator)
      const userId = auth.user?.id

      if (!userId) {
        return response.status(401).json({
          success: false,
          error: 'User not authenticated',
        })
      }

      const results = []

      for (const feedbackId of payload.feedbackIds) {
        try {
          const result = await mastraService.resolveFeedback(feedbackId, userId, payload.resolution)
          results.push({
            feedbackId,
            ...result,
          })
        } catch (error: any) {
          results.push({
            feedbackId,
            success: false,
            error: error.message,
          })
        }
      }

      return response.json({
        success: true,
        data: results,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        error: 'Failed to bulk resolve feedback',
        details: error.message,
      })
    }
  }
}
