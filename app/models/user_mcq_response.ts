import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ResponseStatus } from '#enums/response_status'
import User from './user.js'
import Question from './question.js'
import McqChoice from './mcq_choice.js'

export default class UserMcqResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare questionId: number

  @column()
  declare selectedOption: string

  @column()
  declare choiceId: number

  @column()
  declare isCorrect: boolean

  @column()
  declare status: ResponseStatus

  @column()
  declare originalChoiceText: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => McqChoice, {
    foreignKey: 'choiceId',
  })
  declare choice: BelongsTo<typeof McqChoice>
}
