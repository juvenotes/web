import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeFind, beforeFetch, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class McqChoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare questionId: number

  @column()
  declare choiceText: string

  @column()
  declare isCorrect: boolean

  @column()
  declare explanation: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ autoCreate: false })
  declare deletedAt: DateTime | null

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  static withoutDeleted = scope((query: ModelQueryBuilderContract<typeof McqChoice>) => {
    query.whereNull('deleted_at')
  })

  @beforeFind()
  @beforeFetch()
  static excludeDeletedHook(query: ModelQueryBuilderContract<typeof McqChoice>) {
    query.apply((scopes) => scopes.withoutDeleted())
  }

  static withTrashed = scope((_query: ModelQueryBuilderContract<typeof McqChoice>) => {
    // No filtering - include all records
  })

  static onlyTrashed = scope((query) => {
    query.whereNotNull('deleted_at')
  })
}
