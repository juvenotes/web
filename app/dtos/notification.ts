import { BaseModelDto } from '@adocasts.com/dto/base'
import Notification from '#models/notification'
import UserDto from '#dtos/user'

export default class NotificationDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare initiatorUserId: number | null
  declare notificationType: number
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
  declare isRead: boolean
  declare isActioned: boolean
  declare typeName: string

  constructor(notification?: Notification) {
    super()

    if (!notification) return
    this.id = notification.id
    this.userId = notification.userId
    this.initiatorUserId = notification.initiatorUserId
    this.notificationType = notification.notificationType
    this.relatedTable = notification.relatedTable
    this.relatedId = notification.relatedId
    this.title = notification.title
    this.body = notification.body
    this.href = notification.href
    this.readAt = notification.readAt?.toISO()!
    this.actionedAt = notification.actionedAt?.toISO()!
    this.createdAt = notification.createdAt.toISO()!
    this.updatedAt = notification.updatedAt.toISO()!
    this.user = notification.user && new UserDto(notification.user)
    this.initiator = notification.initiator && new UserDto(notification.initiator)
    this.isRead = notification.isRead
    this.isActioned = notification.isActioned
    this.typeName = notification.typeName
  }
}
