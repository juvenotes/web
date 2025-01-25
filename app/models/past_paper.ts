import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import { ExamType, PaperType } from '#enums/exam_type'
import Concept from './concept.js'
import User from './user.js'

export default class PastPaper extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare conceptId: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare year: string

  @column()
  declare examType: ExamType

  @column()
  declare paperType: PaperType

  @column()
  declare metadata: {
    lastEditedBy?: {
      fullName: string
      timestamp: Date
    }
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @belongsTo(() => Concept)
  declare concept: BelongsTo<typeof Concept>
}
