import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, computed, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Concept from './concept.js'
import { generateSectionSlugFromModels } from '#utils/generate_section_slug'

export default class ConceptSection extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conceptId: number

  @column()
  declare parentSectionId: number | null

  @column()
  declare title: string

  @column()
  declare position: number

  @column()
  declare content: string | null

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Concept)
  declare concept: BelongsTo<typeof Concept>

  @belongsTo(() => ConceptSection, { foreignKey: 'parentSectionId' })
  declare parentSection: BelongsTo<typeof ConceptSection>

  @hasMany(() => ConceptSection, { foreignKey: 'parentSectionId' })
  declare childSections: HasMany<typeof ConceptSection>

  @computed()
  get hasContent(): boolean {
    return !!this.content
  }

  @computed()
  get hasChildSections(): boolean {
    return this.childSections?.length > 0
  }

  @computed()
  get isLeafSection(): boolean {
    return this.hasContent && !this.hasChildSections
  }

  @computed()
  get isParentSection(): boolean {
    return !this.hasContent && this.hasChildSections
  }

  @beforeSave()
  static async generateSlug(section: ConceptSection) {
    if (!section.slug || section.$dirty.position || section.$dirty.title) {
      const concept = await Concept.find(section.conceptId)

      if (section.parentSectionId) {
        const parentSection = await ConceptSection.find(section.parentSectionId)
        section.slug = await generateSectionSlugFromModels(section, concept, parentSection)
      } else {
        section.slug = await generateSectionSlugFromModels(section, concept)
      }
    }
  }
}
