import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Question from './question.js'
import Station from './station.js'

export default class UserOsceResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare questionId: number

  @column()
  declare stationId: number

  @column()
  declare action: string // This will just store 'viewed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => Station, {
    foreignKey: 'stationId',
  })
  declare station: BelongsTo<typeof Station>
}
