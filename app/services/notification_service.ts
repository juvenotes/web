import Notification from '#models/notification'
import { Role } from '#enums/role'
import User from '#models/user'
import EmitterService from './emitter'

export default class NotificationService {
  async createFeedbackNotification(feedback: any) {
    // Get all editors and admins
    const users = await User.query().where('role_id', Role.EDITOR).orWhere('role_id', Role.ADMIN)

    for (const user of users) {
      const notification = await Notification.create({
        userId: user.id,
        type: 'feedback_created',
        data: {
          feedbackId: feedback.id,
          questionId: feedback.questionId,
          feedbackText: feedback.feedbackText,
          submittedBy: feedback.userId,
        },
      })

      await EmitterService.emitNotificationCreated(notification)
    }
  }
}
