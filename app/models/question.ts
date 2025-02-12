import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { QuestionType, DifficultyLevel } from '#enums/question_types'
import Concept from './concept.js'
import User from './user.js'
import McqChoice from './mcq_choice.js'
import SaqPart from './saq_part.js'
import PastPaper from './past_paper.js'
import OscePart from './osce_part.js'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

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

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => OscePart)
  declare osceParts: HasMany<typeof OscePart>

  @manyToMany(() => Concept, {
    pivotTable: 'concept_questions',
  })
  declare concepts: ManyToMany<typeof Concept>

  @hasMany(() => McqChoice)
  declare choices: HasMany<typeof McqChoice>

  @hasMany(() => SaqPart)
  declare parts: HasMany<typeof SaqPart>
  slug: any

  @column()
  declare pastPaperId: number | null

  @belongsTo(() => PastPaper)
  declare pastPaper: BelongsTo<typeof PastPaper>

  @computed()
  get isMcq() {
    return this.type === QuestionType.MCQ
  }

  @computed()
  get isSaq() {
    return this.type === QuestionType.SAQ
  }

  // @computed()
  // get totalMarks() {
  //   if (this.isSaq && this.parts) {
  //     return this.parts.reduce((sum, part) => sum + part.marks, 0)
  //   }
  //   return 1
  // }
}
