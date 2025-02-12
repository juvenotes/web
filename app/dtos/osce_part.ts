import { BaseModelDto } from '@adocasts.com/dto/base'
import OscePart from '#models/osce_part'
import QuestionDto from '#dtos/question'

export default class OscePartDto extends BaseModelDto {
  declare id: number
  declare questionId: number
  declare partText: string
  declare expectedAnswer: string
  declare marks: number
  declare imagePath: string | null
  // declare createdAt: string
  // declare updatedAt: string
  declare question: QuestionDto | null

  constructor(oscePart?: OscePart) {
    super()

    if (!oscePart) return
    this.id = oscePart.id
    this.questionId = oscePart.questionId
    this.partText = oscePart.partText
    this.expectedAnswer = oscePart.expectedAnswer
    this.marks = oscePart.marks
    this.imagePath = oscePart.imagePath
    // this.createdAt = oscePart.createdAt.toISO()!
    // this.updatedAt = oscePart.updatedAt.toISO()!
    this.question = oscePart.question && new QuestionDto(oscePart.question)
  }
}
