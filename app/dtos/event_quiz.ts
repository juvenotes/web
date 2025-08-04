import { BaseModelDto } from '@adocasts.com/dto/base'
import EventQuiz, { type McqQuestion } from '#models/event_quiz'

export default class EventQuizDto extends BaseModelDto {
  declare id: number
  declare eventId: number
  declare title: string
  declare description: string | null
  declare mcqs: McqQuestion[]
  declare createdAt: string
  declare updatedAt: string

  constructor(eventQuiz?: EventQuiz) {
    super()

    if (!eventQuiz) return
    this.id = eventQuiz.id
    this.eventId = eventQuiz.eventId
    this.title = eventQuiz.title
    this.description = eventQuiz.description
    this.mcqs = eventQuiz.mcqs
    this.createdAt = eventQuiz.createdAt.toISO()!
    this.updatedAt = eventQuiz.updatedAt.toISO()!
  }
}
