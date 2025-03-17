import { BaseModelDto } from '@adocasts.com/dto/base'
import Concept from '#models/concept'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'
import PastPaperDto from '#dtos/past_paper'
import { TrainingLevel } from '#enums/training_level'

export default class ConceptDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare parentId: number | null
  declare title: string
  declare slug: string
  declare knowledgeBlock: string | null
  declare isTerminal: boolean
  declare level: number
  declare metadata: any
  declare createdAt: string
  declare updatedAt: string
  declare parent: ConceptDto | null
  declare children: ConceptDto[]
  declare role: UserDto | null
  declare relatedConcepts: ConceptDto[]
  declare questions: QuestionDto[]
  declare pastPapers: PastPaperDto[]
  declare hasChildren: boolean
  declare isRoot: boolean
  declare isRootLevel: boolean
  declare hasOsce: boolean
  declare hasSpot: boolean
  declare trainingLevel: TrainingLevel | null

  constructor(concept?: Concept) {
    super()

    if (!concept) return
    this.id = concept.id
    this.userId = concept.userId
    this.parentId = concept.parentId
    this.title = concept.title
    this.slug = concept.slug
    this.knowledgeBlock = concept.knowledgeBlock
    this.isTerminal = concept.isTerminal
    this.level = concept.level
    this.metadata = concept.metadata
    // this.createdAt = concept.createdAt.toISO()!
    // this.updatedAt = concept.updatedAt.toISO()!
    this.parent = concept.parent && new ConceptDto(concept.parent)
    this.children = ConceptDto.fromArray(concept.children)
    this.role = concept.role && new UserDto(concept.role)
    this.relatedConcepts = ConceptDto.fromArray(concept.relatedConcepts)
    this.questions = QuestionDto.fromArray(concept.questions)
    this.pastPapers = PastPaperDto.fromArray(concept.pastPapers)
    this.hasChildren = concept.hasChildren
    this.isRoot = concept.isRoot
    this.isRootLevel = concept.isRootLevel
    this.hasOsce = concept.hasOsce
    this.hasSpot = concept.hasSpot
    this.trainingLevel = concept.trainingLevel
  }
}
