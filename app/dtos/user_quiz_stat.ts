import { BaseModelDto } from '@adocasts.com/dto/base'
import UserQuizStat from '#models/user_quiz_stat'
import UserDto from '#dtos/user'
import EventQuizDto from '#dtos/event_quiz'

export default class UserQuizStatDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare quizId: number
  declare questionsAttempted: number
  declare questionsCorrect: number
  declare completionPercentage: number
  declare score: number
  declare additionalData: Record<string, any>
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare quiz: EventQuizDto | null

  constructor(userQuizStat?: UserQuizStat) {
    super()

    if (!userQuizStat) return
    this.id = userQuizStat.id
    this.userId = userQuizStat.userId
    this.quizId = userQuizStat.quizId
    this.questionsAttempted = userQuizStat.questionsAttempted
    this.questionsCorrect = userQuizStat.questionsCorrect
    this.completionPercentage = userQuizStat.completionPercentage
    this.score = userQuizStat.score
    this.additionalData = userQuizStat.additionalData
    this.createdAt = userQuizStat.createdAt.toISO()!
    this.updatedAt = userQuizStat.updatedAt.toISO()!
    this.user = userQuizStat.user && new UserDto(userQuizStat.user)
    this.quiz = userQuizStat.quiz && new EventQuizDto(userQuizStat.quiz)
  }
}
