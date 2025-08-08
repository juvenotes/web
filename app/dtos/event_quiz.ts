import { BaseModelDto } from '@adocasts.com/dto/base'
import EventQuiz from '#models/event_quiz'
import EventDto from '#dtos/event'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'

export default class EventQuizDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare eventId: number
  declare title: string
  declare slug: string
  declare description: string | null
  declare createdAt: string
  declare updatedAt: string
  declare event: EventDto | null
  declare user: UserDto | null
  declare questions: QuestionDto[]

  constructor(eventQuiz?: EventQuiz) {
    super()

    if (!eventQuiz) return
    this.id = eventQuiz.id
    this.userId = eventQuiz.userId
    this.eventId = eventQuiz.eventId
    this.title = eventQuiz.title
    this.slug = eventQuiz.slug
    this.description = eventQuiz.description
    this.createdAt = eventQuiz.createdAt.toISO()!
    this.updatedAt = eventQuiz.updatedAt.toISO()!
    this.event = eventQuiz.event && new EventDto(eventQuiz.event)
    this.user = eventQuiz.user && new UserDto(eventQuiz.user)
    this.questions = eventQuiz.questions?.map((question) => new QuestionDto(question)) || []
  }
}
