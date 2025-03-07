import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import NotificationService from '#services/notification_service'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class NotificationsController {
  constructor(protected notificationService: NotificationService) {}

  /**
   * Get paginated notifications for the authenticated user
   */
  async index({ auth, request, response }: HttpContext) {
    const { page = 1, limit = 10, includeRead = false } = request.qs()
    const userId = auth.user!.id

    try {
      const result = await this.notificationService.getForUser(userId, {
        page: Number(page),
        limit: Number(limit),
        includeRead: Boolean(includeRead),
      })

      return response.json(result)
    } catch (error) {
      logger.error('Failed to fetch notifications', { userId, error })
      return response.internalServerError({
        error: 'Failed to fetch notifications',
      })
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead({ auth, params, response }: HttpContext) {
    const notificationId = Number(params.id)
    const userId = auth.user!.id

    try {
      // Verify notification belongs to user before marking as read
      const notification = await this.notificationService.findById(notificationId)

      if (!notification || notification.userId !== userId) {
        return response.forbidden({
          message: 'You cannot access this notification',
        })
      }

      await this.notificationService.markAsRead(notificationId)
      return response.noContent()
    } catch (error) {
      logger.error('Failed to mark notification as read', { notificationId, userId, error })
      return response.internalServerError({
        error: 'Failed to mark notification as read',
      })
    }
  }

  /**
   * Mark all notifications for current user as read
   */
  async markAllAsRead({ auth, response }: HttpContext) {
    const userId = auth.user!.id

    try {
      await this.notificationService.markAllAsRead(userId)
      return response.noContent()
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { userId, error })
      return response.internalServerError({
        error: 'Failed to mark all notifications as read',
      })
    }
  }

  /**
   * Get the count of unread notifications
   */
  async countUnread({ auth, response }: HttpContext) {
    const userId = auth.user!.id

    try {
      const count = await this.notificationService.countUnread(userId)
      return response.json({ count })
    } catch (error) {
      logger.error('Failed to count unread notifications', { userId, error })
      return response.json({ count: 0 }) // Fail gracefully with zero count
    }
  }
}
