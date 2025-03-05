import { BaseModelDto } from '@adocasts.com/dto/base'
import QuestionFeedback from '#models/question_feedback'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'

export default class QuestionFeedbackDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare questionId: number
  declare feedbackText: string
  declare feedbackTarget: string
  declare feedbackSource: string
  declare isResolved: boolean
  declare resolvedAt: string | null
  declare resolvedBy: number | null
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare question: QuestionDto | null

  constructor(questionFeedback?: QuestionFeedback) {
    super()

    if (!questionFeedback) return
    this.id = questionFeedback.id
    this.userId = questionFeedback.userId
    this.questionId = questionFeedback.questionId
    this.feedbackText = questionFeedback.feedbackText
    this.feedbackTarget = questionFeedback.feedbackTarget
    this.feedbackSource = questionFeedback.feedbackSource
    this.isResolved = questionFeedback.isResolved
    this.resolvedAt = questionFeedback.resolvedAt?.toISO()!
    this.resolvedBy = questionFeedback.resolvedBy
    this.createdAt = questionFeedback.createdAt.toISO()!
    this.updatedAt = questionFeedback.updatedAt.toISO()!
    this.user = questionFeedback.user && new UserDto(questionFeedback.user)
    this.question = questionFeedback.question && new QuestionDto(questionFeedback.question)
  }
}
