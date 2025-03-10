// import Notification from '#models/notification'
// import { DateTime } from 'luxon'
// import { inject } from '@adonisjs/core'
// import emitter from '@adonisjs/core/services/emitter'
// import NotificationDto from '#dtos/notification'
// import NotificationType from '#enums/notification_types'
// import logger from '@adonisjs/core/services/logger'
// import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
// import NotificationCreated from '#events/notification_created'
// import PastPaper from '#models/past_paper'
// import transmit from '@adonisjs/transmit/services/main'

// @inject()
// export default class NotificationService {
//   /**
//    * Create a new notification for a user
//    */
//   // async create(
//   //   {
//   //     userId,
//   //     initiatorUserId = null,
//   //     notificationType,
//   //     relatedTable = null,
//   //     relatedId = null,
//   //     title,
//   //     body = null,
//   //     href = null,
//   //   }: {
//   //     userId: number
//   //     initiatorUserId?: number | null
//   //     notificationType: number
//   //     relatedTable?: string | null
//   //     relatedId?: number | null
//   //     title: string
//   //     body?: string | null
//   //     href?: string | null
//   //   },
//   //   trx?: TransactionClientContract | null
//   // ): Promise<Notification> {
//   //   try {
//   //     const notification = new Notification()

//   //     if (trx) notification.useTransaction(trx)

//   //     notification.merge({
//   //       userId,
//   //       initiatorUserId,
//   //       notificationType,
//   //       relatedTable,
//   //       relatedId,
//   //       title,
//   //       body,
//   //       href,
//   //     })

//   //     await notification.save()

//   //     // Broadcast to user-specific channel
//   //     transmit.channel(`user/${userId}`).emit('notification', notificationData)

//   //     // Standard event emissions
//   //     emitter.emit('notification:created', { notificationId: notification.id })

//   //     return notification
//   //   } catch (error) {
//   //     logger.error('Failed to create notification', {
//   //       userId,
//   //       notificationType,
//   //       error,
//   //     })
//   //     throw error
//   //   }
//   // }

//   /**
//    * Create a feedback response notification
//    */
//   async createFeedbackResponse(
//     feedbackId: number,
//     userId: number,
//     responderUserId: number | null = null,
//     trx: TransactionClientContract | null = null
//   ): Promise<Notification> {
//     return this.create(
//       {
//         userId,
//         initiatorUserId: responderUserId,
//         notificationType: NotificationType.FEEDBACK_RESPONSE,
//         relatedTable: 'feedback',
//         relatedId: feedbackId,
//         title: 'Your feedback has received a response',
//         body: 'A team member has responded to your feedback.',
//         href: `/feedback/${feedbackId}`,
//       },
//       trx
//     )
//   }

//   /**
//    * Create today's question notification
//    */
//   async createTodaysQuestionNotification(
//     userId: number,
//     questionId: number,
//     trx: TransactionClientContract | null = null
//   ): Promise<Notification> {
//     return this.create(
//       {
//         userId,
//         notificationType: NotificationType.TODAYS_QUESTION_AVAILABLE,
//         relatedTable: 'questions',
//         relatedId: questionId,
//         title: "Today's question is now available",
//         body: "Test your knowledge with today's featured question.",
//         href: '/today',
//       },
//       trx
//     )
//   }

//   /**
//    * Get notifications for a user with pagination
//    */
//   async getForUser(
//     userId: number,
//     { limit = 10, page = 1, includeRead = false } = {}
//   ): Promise<{
//     notifications: NotificationDto[]
//     meta: any
//   }> {
//     try {
//       const query = Notification.query()
//         .where('user_id', userId)
//         .orderBy('created_at', 'desc')
//         .preload('initiator')
//         .paginate(page, limit)

//       if (!includeRead) {
//         query.whereNull('read_at')
//       }

//       const result = await query

//       return {
//         notifications: NotificationDto.fromArray(result.all()),
//         meta: result.getMeta(),
//       }
//     } catch (error) {
//       logger.error('Error getting notifications for user', { userId, error })
//       throw error
//     }
//   }

//   /**
//    * Find a notification by ID
//    */
//   async findById(id: number): Promise<Notification | null> {
//     try {
//       return await Notification.find(id)
//     } catch (error) {
//       logger.error('Error finding notification by ID', { id, error })
//       return null
//     }
//   }

//   /**
//    * Mark a notification as read
//    */
//   async markAsRead(notificationId: number): Promise<Notification> {
//     try {
//       const notification = await Notification.findOrFail(notificationId)

//       if (!notification.readAt) {
//         notification.readAt = DateTime.now()
//         await notification.save()
//       }

//       return notification
//     } catch (error) {
//       logger.error('Error marking notification as read', { notificationId, error })
//       throw error
//     }
//   }

//   /**
//    * Mark all notifications for a user as read
//    */
//   async markAllAsRead(userId: number): Promise<void> {
//     try {
//       await Notification.query()
//         .where('user_id', userId)
//         .whereNull('read_at')
//         .update({ read_at: DateTime.now().toSQL() })
//     } catch (error) {
//       logger.error('Error marking all notifications as read', { userId, error })
//       throw error
//     }
//   }

//   /**
//    * Count unread notifications for a user
//    */
//   // async countUnread(userId: number): Promise<number> {
//   //   try {
//   //     return await Notification.query()
//   //       .where('user_id', userId)
//   //       .whereNull('read_at')
//   //       .count('* as total')
//   //       .then((result) => Number(result[0].$extras.total))
//   //   } catch (error) {
//   //     logger.error('Error counting unread notifications', { userId, error })
//   //     return 0
//   //   }
//   // }

//   /**
//    * Delete notifications by related entity
//    */
//   // async deleteByRelated(
//   //   relatedTable: string,
//   //   relatedId: number,
//   //   trx?: TransactionClientContract | null
//   // ): Promise<void> {
//   //   try {
//   //     const query = trx ? Notification.query({ client: trx }) : Notification.query()

//   //     await query.where({ relatedTable, relatedId }).delete()
//   //   } catch (error) {
//   //     logger.error('Error deleting notifications by related entity', {
//   //       relatedTable,
//   //       relatedId,
//   //       error,
//   //     })
//   //     throw error
//   //   }
//   // }

//   /**
//    * Create a notification for when a paper is shared with a user
//    */
//   // async createPaperSharedNotification(
//   //   userId: number,
//   //   paperId: number,
//   //   sharerUserId: number | null = null,
//   //   trx: TransactionClientContract | null = null
//   // ): Promise<Notification> {
//   //   try {
//   //     const paper = await PastPaper.findOrFail(paperId)

//   //     return this.create(
//   //       {
//   //         userId,
//   //         initiatorUserId: sharerUserId,
//   //         notificationType: NotificationType.PAPER_SHARED,
//   //         relatedTable: 'past_papers',
//   //         relatedId: paperId,
//   //         title: 'Paper shared with you',
//   //         body: `"${paper.title}" has been shared with you`,
//   //         href: `/papers/${paper.slug}`,
//   //       },
//   //       trx
//   //     )
//   //   } catch (error) {
//   //     logger.error('Failed to create paper shared notification', {
//   //       userId,
//   //       paperId,
//   //       sharerUserId,
//   //       error,
//   //     })
//   //     throw error
//   //   }
//   // }

//   /**
//    * Create a notification for achieving a progress milestone
//    */
//   async createProgressMilestoneNotification(
//     userId: number,
//     milestoneType: string,
//     relatedId: number | null = null,
//     trx: TransactionClientContract | null = null
//   ): Promise<Notification> {
//     try {
//       // Build message based on milestone type
//       let title = 'Achievement unlocked'
//       let body = 'You reached a milestone in your studies'
//       let href = '/dashboard'

//       switch (milestoneType) {
//         case 'PAPER_COMPLETION':
//           title = 'Paper completed!'
//           body = 'You completed all questions in a paper'
//           href = relatedId ? `/papers/view/${relatedId}` : '/papers'
//           break
//         case 'QUESTIONS_COUNT':
//           title = 'Questions milestone'
//           body = "You've answered 50 questions. Keep up the good work!"
//           href = '/dashboard'
//           break
//         case 'STREAK':
//           title = 'Study streak!'
//           body = "You've maintained a study streak for a week"
//           href = '/dashboard'
//           break
//       }

//       return this.create(
//         {
//           userId,
//           initiatorUserId: null, // System-generated notification
//           notificationType: NotificationType.PROGRESS_MILESTONE,
//           relatedTable: milestoneType.toLowerCase().includes('paper') ? 'past_papers' : null,
//           relatedId,
//           title,
//           body,
//           href,
//         },
//         trx
//       )
//     } catch (error) {
//       logger.error('Failed to create milestone notification', {
//         userId,
//         milestoneType,
//         relatedId,
//         error,
//       })
//       throw error
//     }
//   }

//   /**
//    * Create a notification for a newly created paper
//    */
//   // async createPaperCreatedNotification(
//   //   paperTitle: string,
//   //   paperId: number,
//   //   creatorUserId: number,
//   //   recipientUserId: number,
//   //   trx: TransactionClientContract | null = null
//   // ): Promise<Notification> {
//   //   return this.create(
//   //     {
//   //       userId: recipientUserId,
//   //       initiatorUserId: creatorUserId,
//   //       notificationType: NotificationType.PAPER_SHARED,
//   //       relatedTable: 'past_papers',
//   //       relatedId: paperId,
//   //       title: 'New Paper Available',
//   //       body: `"${paperTitle}" has been added to our collection`,
//   //       href: `/papers/${paperId}`,
//   //     },
//   //     trx
//   //   )
//   // }

//   /**
//    * Subscribe to real-time notifications
//    */
//   // async subscribe({ auth, response }: HttpContext) {
//   //   if (!auth.user) {
//   //     return response.unauthorized()
//   //   }

//   //   const userId = auth.user.id

//   //   // Create an SSE connection
//   //   const sse = response.sse()

//   //   // Add client to the user's channel
//   //   transmit.channel(`user:${userId}`).subscribe(sse)

//   //   // Keep the connection alive with periodic heartbeats
//   //   const heartbeat = setInterval(() => {
//   //     sse.event('heartbeat', { timestamp: Date.now() })
//   //   }, 30000)

//   //   // Clean up on disconnect
//   //   sse.onDisconnect = () => {
//   //     clearInterval(heartbeat)
//   //   }

//   //   // Connect the SSE stream
//   //   return sse.connect()
//   // }
// }
