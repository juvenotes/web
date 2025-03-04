import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Question from './question.js'
import SaqPart from './saq_part.js'

export default class UserSaqResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare questionId: number

  @column()
  declare partId: number

  @column()
  declare answerText: string // This will just store 'viewed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => SaqPart, {
    foreignKey: 'partId',
  })
  declare part: BelongsTo<typeof SaqPart>
}
