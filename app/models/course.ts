import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import EducationLevel from './education_level.js'
import Institution from './institution.js'

export default class Course extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare educationLevelId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => EducationLevel)
  declare educationLevel: BelongsTo<typeof EducationLevel>

  @manyToMany(() => Institution, {
    pivotTable: 'institution_courses',
  })
  declare institutions: ManyToMany<typeof Institution>
}
