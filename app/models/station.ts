import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, scope, beforeFind, beforeFetch } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

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

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  static withoutDeleted = scope((query) => {
    query.whereNull('deleted_at')
  })

  static withTrashed = scope((_query: ModelQueryBuilderContract<typeof Station>) => {
    // No filter - include all records
  })

  static onlyTrashed = scope((query) => {
    query.whereNotNull('deleted_at')
  })

  @beforeFind()
  @beforeFetch()
  static excludeDeletedHook(query: ModelQueryBuilderContract<typeof Station>) {
    query.apply((scopes) => scopes.withoutDeleted())
  }
}
