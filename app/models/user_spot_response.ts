import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ResponseStatus } from '#enums/response_status'
import User from './user.js'
import Question from './question.js'
import SpotStation from './spot_station.js'

export default class UserSpotResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare questionId: number

  @column()
  declare stationId: number

  @column()
  declare action: string

  @column()
  declare status: ResponseStatus

  @column()
  declare originalStationText: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => SpotStation, {
    foreignKey: 'stationId',
  })
  declare station: BelongsTo<typeof SpotStation>
}
