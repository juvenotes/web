import { BaseModelDto } from '@adocasts.com/dto/base'
import PastPaper from '#models/past_paper'
import { ExamType, PaperType } from '#enums/exam_type'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'
import ConceptDto from '#dtos/concept'

export default class PastPaperDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare conceptId: number
  declare title: string
  declare slug: string
  declare year: string
  declare metadata: any
  declare examType: ExamType
  declare paperType: PaperType
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare questions: QuestionDto[]
  declare concept: ConceptDto | null

  constructor(pastPaper?: PastPaper) {
    super()

    if (!pastPaper) return
    this.id = pastPaper.id
    this.userId = pastPaper.userId
    this.conceptId = pastPaper.conceptId
    this.title = pastPaper.title
    this.slug = pastPaper.slug
    this.year = pastPaper.year
    this.examType = pastPaper.examType
    this.paperType = pastPaper.paperType
    this.metadata = pastPaper.metadata
    // this.createdAt = pastPaper.createdAt.toISO()!
    // this.updatedAt = pastPaper.updatedAt.toISO()!
    this.user = pastPaper.user && new UserDto(pastPaper.user)
    this.questions = QuestionDto.fromArray(pastPaper.questions)
    this.concept = pastPaper.concept && new ConceptDto(pastPaper.concept)
  }
}
