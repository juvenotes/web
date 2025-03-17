import { BaseModelDto } from '@adocasts.com/dto/base'
import SpotStation from '#models/spot_station'
import QuestionDto from '#dtos/question'

export default class SpotStationDto extends BaseModelDto {
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

  constructor(spotStation?: SpotStation) {
    super()

    if (!spotStation) return
    this.id = spotStation.id
    this.questionId = spotStation.questionId
    this.partText = spotStation.partText
    this.expectedAnswer = spotStation.expectedAnswer
    this.marks = spotStation.marks
    this.imagePath = spotStation.imagePath
    this.createdAt = spotStation.createdAt.toISO()!
    this.updatedAt = spotStation.updatedAt.toISO()!
    this.deletedAt = spotStation.deletedAt?.toISO()!
    this.question = spotStation.question && new QuestionDto(spotStation.question)
  }
}