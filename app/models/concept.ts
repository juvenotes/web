import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo, manyToMany, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Question from './question.js'
import User from './user.js'
import PastPaper from './past_paper.js'

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

  public isRootLevel() {
    return this.level === 0
  }

  @computed()
  get hasChildren() {
    return this.children?.length > 0
  }

  @computed()
  get isRoot() {
    return this.parentId === null
  }
}
