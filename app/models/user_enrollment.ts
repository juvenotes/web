import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import InstitutionCourse from './institution_course.js'

export default class UserEnrollment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare institutionCourseId: number

  @column()
  declare graduationYear: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => InstitutionCourse)
  declare institutionCourse: BelongsTo<typeof InstitutionCourse>
}
