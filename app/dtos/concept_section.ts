import { BaseModelDto } from '@adocasts.com/dto/base'
import ConceptSection from '#models/concept_section'
import ConceptDto from '#dtos/concept'

export default class ConceptSectionDto extends BaseModelDto {
  declare id: number
  declare conceptId: number
  declare parentSectionId: number | null
  declare title: string
  declare position: number
  declare content: string | null
  declare slug: string
  declare createdAt: string
  declare updatedAt: string
  declare concept: ConceptDto | null
  declare parentSection: ConceptSectionDto | null
  declare childSections: ConceptSectionDto[]
  declare hasContent: boolean
  declare hasChildSections: boolean
  declare isLeafSection: boolean
  declare isParentSection: boolean

  constructor(conceptSection?: ConceptSection) {
    super()

    if (!conceptSection) return
    this.id = conceptSection.id
    this.conceptId = conceptSection.conceptId
    this.parentSectionId = conceptSection.parentSectionId
    this.title = conceptSection.title
    this.position = conceptSection.position
    this.content = conceptSection.content
    this.slug = conceptSection.slug
    this.createdAt = conceptSection.createdAt.toISO()!
    this.updatedAt = conceptSection.updatedAt.toISO()!
    this.concept = conceptSection.concept && new ConceptDto(conceptSection.concept)
    this.parentSection =
      conceptSection.parentSection && new ConceptSectionDto(conceptSection.parentSection)
    this.childSections = ConceptSectionDto.fromArray(conceptSection.childSections)
    this.hasContent = conceptSection.hasContent
    this.hasChildSections = conceptSection.hasChildSections
    this.isLeafSection = conceptSection.isLeafSection
    this.isParentSection = conceptSection.isParentSection
  }
}
