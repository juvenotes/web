import { BaseModelDto } from '@adocasts.com/dto/base'
import Today from '#models/today'
import { TodayStatus } from '#enums/today_status'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'

export default class TodayDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare title: string
  declare slug: string
  declare scheduledFor: string
  declare status: TodayStatus
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare questions: QuestionDto[]

  constructor(today?: Today) {
    super()

    if (!today) return
    this.id = today.id
    this.userId = today.userId
    this.title = today.title
    this.slug = today.slug
    this.scheduledFor = today.scheduledFor
    this.status = today.status
    this.createdAt = today.createdAt?.toISO() || ''
    this.updatedAt = today.updatedAt?.toISO() || ''
    this.user = today.user && new UserDto(today.user)
    this.questions = QuestionDto.fromArray(today.questions)
  }
}
