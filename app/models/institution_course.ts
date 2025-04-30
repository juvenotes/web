import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Institution from './institution.js'
import Course from './course.js'
import UserEnrollment from './user_enrollment.js'

export default class InstitutionCourse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare institutionId: number

  @column()
  declare courseId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Institution)
  declare institution: BelongsTo<typeof Institution>

  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>

  @hasMany(() => UserEnrollment)
  declare userEnrollments: HasMany<typeof UserEnrollment>
}
