import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import PastPaper from './past_paper.js'

export default class UserPaperStat extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare paperId: number

  @column()
  declare questionsAttempted: number

  @column()
  declare questionsCorrect: number

  @column()
  declare completionPercentage: number

  @column()
  declare additionalData: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => PastPaper, {
    foreignKey: 'paperId',
  })
  declare paper: BelongsTo<typeof PastPaper>
}
