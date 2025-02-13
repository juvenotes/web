import { BaseModelDto } from '@adocasts.com/dto/base'
import Question from '#models/question'
import { QuestionType, DifficultyLevel } from '#enums/question_types'
import UserDto from '#dtos/user'
import ConceptDto from '#dtos/concept'
import McqChoiceDto from '#dtos/mcq_choice'
import SaqPartDto from '#dtos/saq_part'
import PastPaperDto from '#dtos/past_paper'
import OscePartDto from './osce_part.js'

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
  declare choices: McqChoiceDto[]
  declare parts: SaqPartDto[]
  declare osceParts: OscePartDto[]
  declare slug: any
  declare pastPaperId: number | null
  declare pastPaper: PastPaperDto | null
  declare isMcq: boolean
  declare isSaq: boolean

  constructor(question?: Question) {
    super()

    if (!question) return
    this.id = question.id
    this.userId = question.userId
    this.type = question.type
    this.questionText = question.questionText
    this.questionImagePath = question.questionImagePath
    this.difficultyLevel = question.difficultyLevel
    // this.createdAt = question.createdAt.toISO()!
    // this.updatedAt = question.updatedAt.toISO()!
    this.user = question.user && new UserDto(question.user)
    this.concepts = ConceptDto.fromArray(question.concepts)
    this.choices = McqChoiceDto.fromArray(question.choices)
    this.parts = SaqPartDto.fromArray(question.parts)
    this.osceParts = OscePartDto.fromArray(question.osceParts)
    this.slug = question.slug
    this.pastPaperId = question.pastPaperId
    this.pastPaper = question.pastPaper && new PastPaperDto(question.pastPaper)
    this.isMcq = question.isMcq
    this.isSaq = question.isSaq
  }
}
