import { BaseModelDto } from '@adocasts.com/dto/base'
import ConceptCitation from '#models/concept_citation'
import ConceptDto from '#dtos/concept'

export default class ConceptCitationDto extends BaseModelDto {
  declare id: number
  declare conceptId: number
  declare citationText: string // e.g., Smith J, Doe J. Hypertension Review. J Med 2024; 152
  declare citationNumber: number // Assigned dynamically
  declare concept: ConceptDto | null

  constructor(conceptCitation?: ConceptCitation) {
    super()

    if (!conceptCitation) return
    this.id = conceptCitation.id
    this.conceptId = conceptCitation.conceptId
    this.citationText = conceptCitation.citationText
    this.citationNumber = conceptCitation.citationNumber
    this.concept = conceptCitation.concept && new ConceptDto(conceptCitation.concept)
  }
}