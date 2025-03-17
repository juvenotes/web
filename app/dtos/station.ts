import { BaseModelDto } from '@adocasts.com/dto/base'
import Station from '#models/station'
import QuestionDto from '#dtos/question'

export default class StationDto extends BaseModelDto {
  declare id: number
  declare questionId: number
  declare partText: string
  declare expectedAnswer: string
  declare marks: number
  declare imagePath: string | null
  declare createdAt: string
  declare updatedAt: string
  declare deletedAt: string | null
  declare question: QuestionDto | null

  constructor(station?: Station) {
    super()

    if (!station) return
    this.id = station.id
    this.questionId = station.questionId
    this.partText = station.partText
    this.expectedAnswer = station.expectedAnswer
    this.marks = station.marks
    this.imagePath = station.imagePath
    this.createdAt = station.createdAt?.toISO() || ''
    this.updatedAt = station.updatedAt?.toISO() || ''
    this.deletedAt = station.deletedAt?.toISO() || ''
    this.question = station.question && new QuestionDto(station.question)
  }
}
