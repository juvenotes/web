import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import EventQuiz from './event_quiz.js'

export default class QuizSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare quizId: number

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare endedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare tabSwitches: number

  @column()
  declare focusLosses: number

  @column()
  declare activityLog: Record<string, any> | null

  @column()
  declare autoSubmitted: boolean

  @column()
  declare status: 'active' | 'completed' | 'abandoned' | 'submitted'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => EventQuiz, {
    foreignKey: 'quizId',
  })
  declare quiz: BelongsTo<typeof EventQuiz>
}