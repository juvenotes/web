import { BaseModelDto } from '@adocasts.com/dto/base'
import McqChoice from '#models/mcq_choice'
import QuestionDto from '#dtos/question'

export default class McqChoiceDto extends BaseModelDto {
  declare id: number
  declare questionId: number
  declare choiceText: string
  declare isCorrect: boolean
  declare explanation: string | null
  declare createdAt: string
  declare updatedAt: string
  declare question: QuestionDto | null

  constructor(mcqChoice?: McqChoice) {
    super()

    if (!mcqChoice) return
    this.id = mcqChoice.id
    this.questionId = mcqChoice.questionId
    this.choiceText = mcqChoice.choiceText
    this.isCorrect = mcqChoice.isCorrect
    this.explanation = mcqChoice.explanation
    // this.createdAt = mcqChoice.createdAt.toISO()!
    // this.updatedAt = mcqChoice.updatedAt.toISO()!
    this.question = mcqChoice.question && new QuestionDto(mcqChoice.question)
  }
}
