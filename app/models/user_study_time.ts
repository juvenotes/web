import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class UserStudyTime extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare date: string

  @column.dateTime()
  declare lastActivityAt: DateTime

  @column()
  declare conceptViews: number

  @column()
  declare mcqAttempts: number

  @column()
  declare saqViews: number

  @column()
  declare osceViews: number

  @column()
  declare spotViews: number

  @column()
  declare paperViews: number

  @column()
  declare totalSeconds: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
