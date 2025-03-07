import { inject } from '@adonisjs/core'
import NotificationCreated from '#events/notification_created'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class ProcessNotification {
  async handle(event: NotificationCreated) {
    const { notification } = event

    logger.info('Processing notification', {
      notificationId: notification.id,
      userId: notification.userId,
      notificationType: notification.notificationType,
    })

    // Future integration with push notifications or other services
    // would go here
  }
}
