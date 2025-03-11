import { BaseModelDto } from '@adocasts.com/dto/base'
import Question from '#models/question'
import { QuestionType, DifficultyLevel } from '#enums/question_types'
import UserDto from '#dtos/user'
import ConceptDto from '#dtos/concept'
import McqChoiceDto from '#dtos/mcq_choice'
import SaqPartDto from '#dtos/saq_part'
import PastPaperDto from '#dtos/past_paper'
import StationDto from './station.js'
import TodayDto from '#dtos/today'

export default class QuestionDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare type: QuestionType
  declare questionText: string
  declare questionImagePath: string | null
  declare difficultyLevel: DifficultyLevel
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare concepts: ConceptDto[]
  declare topics: ConceptDto[]
  declare units: ConceptDto[]
  declare choices: McqChoiceDto[]
  declare parts: SaqPartDto[]
  declare stations: StationDto[]
  declare slug: any
  declare pastPaperId: number | null
  declare todayId: number | null
  declare pastPaper: PastPaperDto | null
  declare today: TodayDto | null
  declare isMcq: boolean
  declare isSaq: boolean
  declare isOsce: boolean

  constructor(question?: Question) {
    super()

    if (!question) return
    this.id = question.id
    this.userId = question.userId
    this.type = question.type
    this.questionText = question.questionText
    this.questionImagePath = question.questionImagePath
    this.difficultyLevel = question.difficultyLevel
    this.createdAt = question.createdAt?.toISO() || ''
    this.updatedAt = question.updatedAt?.toISO() || ''
    this.user = question.user && new UserDto(question.user)
    this.concepts = ConceptDto.fromArray(question.concepts)
    this.topics = ConceptDto.fromArray(question.topics || [])
    this.units = ConceptDto.fromArray(question.units || [])
    this.choices = McqChoiceDto.fromArray(question.choices)
    this.parts = SaqPartDto.fromArray(question.parts)
    this.stations = StationDto.fromArray(question.stations)
    this.slug = question.slug
    this.pastPaperId = question.pastPaperId
    this.todayId = question.todayId
    this.pastPaper = question.pastPaper && new PastPaperDto(question.pastPaper)
    this.today = question.today && new TodayDto(question.today)
    this.isMcq = question.isMcq
    this.isSaq = question.isSaq
    this.isOsce = question.isOsce
  }
}
