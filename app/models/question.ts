import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Concept from './concept.js'

type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E'

interface MCQConfig {
  options: Record<OptionKey, string>
  correct_answer: OptionKey
  explanations: Record<OptionKey, string>
}

interface RubricPoint {
  text: string
  marks: number
}

interface RubricSection {
  point: string
  subpoints: RubricPoint[]
}

interface QuestionPart {
  part_number: number
  text: string
  marks: number
  rubric: RubricSection[]
  model_answer: string
  notes?: string
}

interface SAQConfig {
  parts: QuestionPart[]
  total_marks: number
  pass_mark: number
  time_allocation_minutes: number
}

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conceptId: number | null

  @column()
  declare type: 'mcq' | 'saq'

  @column()
  declare questionText: string

  @column()
  declare config: MCQConfig | SAQConfig

  @column()
  declare marks: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Concept)
  declare concept: BelongsTo<typeof Concept>

  isMCQ(): this is { config: MCQConfig } {
    return this.type === 'mcq'
  }

  isSAQ(): this is { config: SAQConfig } {
    return this.type === 'saq'
  }

  validateAnswer(answer: string): boolean {
    if (this.isMCQ()) {
      return answer === this.config.correct_answer
    }
    return false
  }

  getExplanation(option: OptionKey): string | null {
    if (this.isMCQ()) {
      return this.config.explanations[option] || null
    }
    return null
  }

  getTotalMarks(): number {
    if (this.isSAQ()) {
      return this.config.total_marks
    }
    return this.marks
  }
}
