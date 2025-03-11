import { BaseModelDto } from '@adocasts.com/dto/base'
import UserTodayStat from '#models/user_today_stat'

export default class UserTodayStatsDto extends BaseModelDto {
  declare id: number
  declare createdAt: string
  declare updatedAt: string

  constructor(userTodayStats?: UserTodayStat) {
    super()

    if (!userTodayStats) return
    this.id = userTodayStats.id
    this.createdAt = userTodayStats.createdAt.toISO()!
    this.updatedAt = userTodayStats.updatedAt.toISO()!
  }
}