import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  hasMany,
  beforeFind,
  beforeFetch,
  scope,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import { ExamType, PaperType } from '#enums/exam_type'
import Concept from './concept.js'
import User from './user.js'
import { StudyLevel } from '#enums/study_level'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

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
  declare studyLevel: StudyLevel | null

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

  @column.dateTime({ autoCreate: false })
  declare deletedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @belongsTo(() => Concept)
  declare concept: BelongsTo<typeof Concept>

  static withoutDeleted = scope((query: ModelQueryBuilderContract<typeof PastPaper>) => {
    query.whereNull('deleted_at')
  })

  @beforeFind()
  @beforeFetch()
  static excludeDeletedHook(query: ModelQueryBuilderContract<typeof PastPaper>) {
    query.apply((scopes) => scopes.withoutDeleted())
  }

  static withTrashed = scope((_query: ModelQueryBuilderContract<typeof PastPaper>) => {
    // No filtering - include all records
  })

  static onlyTrashed = scope((query: ModelQueryBuilderContract<typeof PastPaper>) => {
    query.whereNotNull('deleted_at')
  })
}
