import { BaseModelDto } from '@adocasts.com/dto/base'
import Notification from '#models/notification'
import UserDto from '#dtos/user'
import { formatDistanceToNow } from 'date-fns'

export default class NotificationDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare initiatorUserId: number | null
  declare notificationType: number
  declare typeName: string
  declare relatedTable: string | null
  declare relatedId: number | null
  declare title: string
  declare body: string | null
  declare href: string | null
  declare readAt: string | null
  declare actionedAt: string | null
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare initiator: UserDto | null
  declare timeAgo: string

  constructor(notification?: Notification) {
    super()

    if (!notification) return

    this.id = notification.id
    this.userId = notification.userId
    this.initiatorUserId = notification.initiatorUserId
    this.notificationType = notification.notificationType
    this.typeName = notification.typeName
    this.relatedTable = notification.relatedTable
    this.relatedId = notification.relatedId
    this.title = notification.title
    this.body = notification.body
    this.href = notification.href
    this.readAt = notification.readAt?.toISO() ?? null
    this.actionedAt = notification.actionedAt?.toISO() ?? null
    this.createdAt = notification.createdAt.toISO()
    this.updatedAt = notification.updatedAt.toISO()

    this.user = notification.user ? new UserDto(notification.user) : null
    this.initiator = notification.initiator ? new UserDto(notification.initiator) : null

    // Add human-readable time
    this.timeAgo = formatDistanceToNow(notification.createdAt.toJSDate(), { addSuffix: true })
  }

  static fromModel(notification: Notification): NotificationDto {
    return new NotificationDto(notification)
  }

  static fromArray(notifications: Notification[]): NotificationDto[] {
    return notifications.map(notification => new NotificationDto(notification))
  }
}