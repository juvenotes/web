import { BaseModelDto } from '@adocasts.com/dto/base'
import SaqPart from '#models/saq_part'
import QuestionDto from '#dtos/question'

export default class SaqPartDto extends BaseModelDto {
  declare id: number
  declare questionId: number
  declare partText: string
  declare expectedAnswer: string
  declare marks: number
  declare createdAt: string
  declare updatedAt: string
  declare deletedAt: string | null
  declare question: QuestionDto | null

  constructor(saqPart?: SaqPart) {
    super()

    if (!saqPart) return
    this.id = saqPart.id
    this.questionId = saqPart.questionId
    this.partText = saqPart.partText
    this.expectedAnswer = saqPart.expectedAnswer
    this.marks = saqPart.marks
    this.createdAt = saqPart.createdAt?.toISO() || ''
    this.updatedAt = saqPart.updatedAt?.toISO() || ''
    this.deletedAt = saqPart.deletedAt?.toISO() || ''
    this.question = saqPart.question && new QuestionDto(saqPart.question)
  }
}
