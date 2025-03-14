import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeFind, beforeFetch, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class SaqPart extends BaseModel {
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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ autoCreate: false })
  declare deletedAt: DateTime | null

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  static withoutDeleted = scope((query: ModelQueryBuilderContract<typeof SaqPart>) => {
    query.whereNull('deleted_at')
  })

  @beforeFind()
  @beforeFetch()
  static excludeDeletedHook(query: ModelQueryBuilderContract<typeof SaqPart>) {
    query.apply((scopes) => scopes.withoutDeleted())
  }

  static withTrashed = scope((_query: ModelQueryBuilderContract<typeof SaqPart>) => {
    // No filtering - include all records
  })

  static onlyTrashed = scope((query) => {
    query.whereNotNull('deleted_at')
  })
}
