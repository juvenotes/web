import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import Question from './question.js'
import User from './user.js'
import UserQuizStat from './user_quiz_stat.js'

export default class EventQuiz extends BaseModel {
  public static table = 'event_quizzes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare eventId: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare status: 'draft' | 'published'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @hasMany(() => UserQuizStat, {
    foreignKey: 'quizId',
  })
  declare userStats: HasMany<typeof UserQuizStat>
}
