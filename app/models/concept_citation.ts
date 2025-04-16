import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Concept from './concept.js'

export default class ConceptCitation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conceptId: number

  @column()
  declare citationText: string // e.g., "Smith J, Doe J. Hypertension Review. J Med 2024; 15(2):123-130."

  @column()
  declare citationNumber: number // Assigned dynamically

  @belongsTo(() => Concept)
  declare concept: BelongsTo<typeof Concept>
}
