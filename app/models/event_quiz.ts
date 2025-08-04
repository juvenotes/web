import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'

export interface McqQuestion {
  question: string
  choices: string[]
  correctAnswer: number
  explanation?: string
}

export default class EventQuiz extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare eventId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column({
    prepare: (value: McqQuestion[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare mcqs: McqQuestion[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>
}
