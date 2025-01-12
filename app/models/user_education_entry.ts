import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import EducationLevel from './education_level.js'

export default class UserEducationEntry extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare institutionCourseId: number

  @column()
  declare educationLevelId: number

  @column()
  declare graduationYear: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => EducationLevel)
  declare educationLevel: BelongsTo<typeof EducationLevel>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
