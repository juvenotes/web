import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import Institution from './institution.js'
import Course from './course.js'
import EducationLevel from './education_level.js'
import UserEducationEntry from './user_education_entry.js'

export default class InstitutionCourse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare institutionId: number

  @column()
  declare courseId: number

  @column()
  declare educationLevelId: number

  @column()
  declare isActive: boolean

  @belongsTo(() => Institution)
  declare institution: BelongsTo<typeof Institution>

  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>

  @belongsTo(() => EducationLevel)
  declare educationLevel: BelongsTo<typeof EducationLevel>

  @hasMany(() => UserEducationEntry)
  declare userEducationEntries: HasMany<typeof UserEducationEntry>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
