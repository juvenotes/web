import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
  beforeFind,
  beforeFetch,
  scope,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { QuestionType, DifficultyLevel } from '#enums/question_types'
import Concept from './concept.js'
import User from './user.js'
import McqChoice from './mcq_choice.js'
import SaqPart from './saq_part.js'
import PastPaper from './past_paper.js'
import Station from './station.js'
import Today from './today.js'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import SpotStation from './spot_station.js'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare slug: string

  @column()
  declare type: QuestionType

  @column()
  declare questionText: string

  @column()
  declare difficultyLevel: DifficultyLevel

  @column()
  declare questionImagePath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ autoCreate: false })
  declare deletedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Station)
  declare stations: HasMany<typeof Station>

  @manyToMany(() => Concept, {
    pivotTable: 'concept_questions',
  })
  declare concepts: ManyToMany<typeof Concept>

  @manyToMany(() => Concept, {
    pivotTable: 'question_topics',
    localKey: 'id',
    pivotForeignKey: 'question_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'topic_id',
  })
  declare topics: ManyToMany<typeof Concept>

  @manyToMany(() => Concept, {
    pivotTable: 'question_units',
    localKey: 'id',
    pivotForeignKey: 'question_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'unit_id',
  })
  declare units: ManyToMany<typeof Concept>

  @hasMany(() => McqChoice)
  declare choices: HasMany<typeof McqChoice>

  @hasMany(() => SaqPart)
  declare parts: HasMany<typeof SaqPart>

  @hasMany(() => SpotStation)
  declare spotStations: HasMany<typeof SpotStation>

  @column()
  declare pastPaperId: number | null

  @column()
  declare todayId: number | null

  @belongsTo(() => PastPaper)
  declare pastPaper: BelongsTo<typeof PastPaper>

  @belongsTo(() => Today)
  declare today: BelongsTo<typeof Today>

  @computed()
  get isMcq() {
    return this.type === QuestionType.MCQ
  }

  @computed()
  get isSaq() {
    return this.type === QuestionType.SAQ
  }

  @computed()
  get isOsce() {
    return this.type === QuestionType.OSCE
  }

  @computed()
  get isSpot() {
    return this.type === QuestionType.SPOT
  }

  static withoutDeleted = scope((query: ModelQueryBuilderContract<typeof Question>) => {
    query.whereNull('deleted_at')
  })

  @beforeFind()
  @beforeFetch()
  static excludeDeletedHook(query: ModelQueryBuilderContract<typeof Question>) {
    query.apply((scopes) => scopes.withoutDeleted())
  }

  static withTrashed = scope((_query: ModelQueryBuilderContract<typeof Question>) => {
    // No filtering - include all records
  })

  static onlyTrashed = scope((query) => {
    query.whereNotNull('deleted_at')
  })

  // @computed()
  // get totalMarks() {
  //   if (this.isSaq && this.parts) {
  //     return this.parts.reduce((sum, part) => sum + part.marks, 0)
  //   }
  //   return 1
  // }
}
