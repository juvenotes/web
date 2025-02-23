import { BaseModelDto } from '@adocasts.com/dto/base'
import Notification from '#models/notification'
import UserDto from '#dtos/user'

export default class NotificationDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare type: string
  declare data: any
  declare readAt: string | null
  // declare createdAt: string
  // declare updatedAt: string
  declare user: UserDto | null

  constructor(notification?: Notification) {
    super()

    if (!notification) return
    this.id = notification.id
    this.userId = notification.userId
    this.type = notification.type
    this.data = notification.data
    this.readAt = notification.readAt?.toISO()!
    // this.createdAt = notification.createdAt.toISO()!
    // this.updatedAt = notification.updatedAt.toISO()!
    this.user = notification.user && new UserDto(notification.user)
  }
}
