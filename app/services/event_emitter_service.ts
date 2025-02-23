import emitter from '@adonisjs/core/services/emitter'
import { NotificationType } from '#enums/notification_type'

class EmitterService {
  async emitFeedbackCreated(feedback: any) {
    await emitter.emit('feedback:created', feedback)
  }

  async emitNotificationCreated(notification: any) {
    await emitter.emit('notification:created', notification)
  }
}

export default new EmitterService()
