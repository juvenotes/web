import { BaseModelDto } from '@adocasts.com/dto/base'
import UserStudyTime from '#models/user_study_time'
import UserDto from '#dtos/user'

export default class UserStudyTimeDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare date: string
  declare lastActivityAt: string
  declare conceptViews: number
  declare mcqAttempts: number
  declare saqViews: number
  declare osceViews: number
  declare spotViews: number
  declare paperViews: number
  declare totalSeconds: number
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null

  constructor(userStudyTime?: UserStudyTime) {
    super()

    if (!userStudyTime) return
    this.id = userStudyTime.id
    this.userId = userStudyTime.userId
    this.date = userStudyTime.date
    this.lastActivityAt = userStudyTime.lastActivityAt.toISO()!
    this.conceptViews = userStudyTime.conceptViews
    this.mcqAttempts = userStudyTime.mcqAttempts
    this.saqViews = userStudyTime.saqViews
    this.osceViews = userStudyTime.osceViews
    this.spotViews = userStudyTime.spotViews
    this.paperViews = userStudyTime.paperViews
    this.totalSeconds = userStudyTime.totalSeconds
    this.createdAt = userStudyTime.createdAt.toISO()!
    this.updatedAt = userStudyTime.updatedAt.toISO()!
    this.user = userStudyTime.user && new UserDto(userStudyTime.user)
  }
}
