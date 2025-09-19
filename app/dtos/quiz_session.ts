import { BaseModelDto } from '@adocasts.com/dto/base'
import QuizSession from '#models/quiz_session'
import UserDto from '#dtos/user'
import EventQuizDto from '#dtos/event_quiz'

export default class QuizSessionDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare quizId: number
  declare startedAt: string | null
  declare endedAt: string | null
  declare expiresAt: string | null
  declare tabSwitches: number
  declare focusLosses: number
  declare activityLog: Record<string, any> | null
  declare autoSubmitted: boolean
  declare status: 'active' | 'completed' | 'abandoned' | 'submitted'
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare quiz: EventQuizDto | null

  constructor(quizSession?: QuizSession) {
    super()

    if (!quizSession) return
    this.id = quizSession.id
    this.userId = quizSession.userId
    this.quizId = quizSession.quizId
    this.startedAt = quizSession.startedAt?.toISO() || null
    this.endedAt = quizSession.endedAt?.toISO() || null
    this.expiresAt = quizSession.expiresAt?.toISO() || null
    this.tabSwitches = quizSession.tabSwitches
    this.focusLosses = quizSession.focusLosses
    this.activityLog = quizSession.activityLog
    this.autoSubmitted = quizSession.autoSubmitted
    this.status = quizSession.status
    this.createdAt = quizSession.createdAt.toISO()!
    this.updatedAt = quizSession.updatedAt.toISO()!
    this.user = quizSession.user && new UserDto(quizSession.user)
    this.quiz = quizSession.quiz && new EventQuizDto(quizSession.quiz)
  }
}