import { BaseModelDto } from '@adocasts.com/dto/base'
import UserStreak from '#models/user_streak'
import UserDto from '#dtos/user'

export default class UserStreakDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare currentStreak: number
  declare longestStreak: number
  declare lastActivityAt: string
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null

  constructor(userStreak?: UserStreak) {
    super()

    if (!userStreak) return
    this.id = userStreak.id
    this.userId = userStreak.userId
    this.currentStreak = userStreak.currentStreak
    this.longestStreak = userStreak.longestStreak
    this.lastActivityAt = userStreak.lastActivityAt.toISO()!
    this.createdAt = userStreak.createdAt.toISO()!
    this.updatedAt = userStreak.updatedAt.toISO()!
    this.user = userStreak.user && new UserDto(userStreak.user)
  }
}
