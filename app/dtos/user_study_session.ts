import { BaseModelDto } from '@adocasts.com/dto/base'
import UserStudySession from '#models/user_study_session'
import UserDto from '#dtos/user'

export default class UserStudySessionDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare resourceType: 'concept' | 'paper' | 'osce' | 'spot' | 'today'
  declare resourceId: number
  declare startedAt: string
  declare lastActivityAt: string
  declare isActive: boolean
  declare durationSeconds: number
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null

  constructor(userStudySession?: UserStudySession) {
    super()

    if (!userStudySession) return
    this.id = userStudySession.id
    this.userId = userStudySession.userId
    this.resourceType = userStudySession.resourceType
    this.resourceId = userStudySession.resourceId
    this.startedAt = userStudySession.startedAt.toISO()!
    this.lastActivityAt = userStudySession.lastActivityAt.toISO()!
    this.isActive = userStudySession.isActive
    this.durationSeconds = userStudySession.durationSeconds
    this.createdAt = userStudySession.createdAt.toISO()!
    this.updatedAt = userStudySession.updatedAt.toISO()!
    this.user = userStudySession.user && new UserDto(userStudySession.user)
  }
}
