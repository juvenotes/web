import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo, manyToMany, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import User from './user.js'
import PastPaper from './past_paper.js'
import { TrainingLevel } from '#enums/training_level'
// import { Searchable } from '@foadonis/magnify'
// import { compose } from '@adonisjs/core/helpers'

export default class Concept extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare parentId: number | null

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare knowledgeBlock: string | null

  @column()
  declare isTerminal: boolean

  @column()
  declare level: number

  @column()
  declare hasOsce: boolean

  @column()
  declare hasSpot: boolean

  @column()
  declare trainingLevel: TrainingLevel | null

  @column()
  declare metadata: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Concept, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Concept>

  @hasMany(() => Concept, { foreignKey: 'parentId' })
  declare children: HasMany<typeof Concept>

  @belongsTo(() => User)
  declare role: BelongsTo<typeof User>

  @manyToMany(() => Concept, {
    pivotTable: 'related_concepts',
    pivotForeignKey: 'concept_id',
    pivotRelatedForeignKey: 'related_concept_id',
  })
  declare relatedConcepts: ManyToMany<typeof Concept>

  @manyToMany(() => Question, {
    pivotTable: 'concept_questions',
  })
  declare questions: ManyToMany<typeof Question>

  @hasMany(() => PastPaper)
  declare pastPapers: HasMany<typeof PastPaper>

  @computed()
  public get hasChildren(): boolean {
    return this.children?.length > 0
  }

  @computed()
  public get isRoot(): boolean {
    return this.parentId === null
  }

  @computed()
  public get isRootLevel(): boolean {
    return this.level === 0
  }

  public static async searchConceptByTitle(query: string, limit = 5, adminSearch = false) {
    const baseQuery = this.query()
      .whereILike('title', `%${query}%`)
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])
      .limit(limit)
      .orderBy('title', 'asc')

    // Only filter for terminal concepts in non-admin search
    if (!adminSearch) {
      baseQuery.where('is_terminal', true)
    }

    return await baseQuery
  }

  // toSearchableObject() {
  //   return {
  //     id: this.id,
  //     title: this.title,
  //     slug: this.slug,
  //     knowledgeBlock: this.knowledgeBlock,
  //     isTerminal: this.isTerminal,
  //     level: this.level,
  //   }
  // }
}
