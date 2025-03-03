import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import PastPaper from './past_paper.js'
import Question from './question.js'

export default class UserPaperProgress extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare paperId: number

  @column()
  declare lastQuestionId: number | null

  @column.dateTime()
  declare lastVisitedAt: DateTime

  @column()
  declare attemptCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => PastPaper)
  declare paper: BelongsTo<typeof PastPaper>

  @belongsTo(() => Question)
  declare lastQuestion: BelongsTo<typeof Question>
}
