import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UserStudySession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare resourceType: 'concept' | 'paper' | 'osce' | 'spot' | 'today'

  @column()
  declare resourceId: number

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare lastActivityAt: DateTime

  @column()
  declare isActive: boolean

  @column()
  declare durationSeconds: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
