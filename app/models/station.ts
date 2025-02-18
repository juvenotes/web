import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Question from './question.js'

export default class Station extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare questionId: number

  @column()
  declare partText: string

  @column()
  declare expectedAnswer: string

  @column()
  declare marks: number

  @column()
  declare imagePath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>
}
