import { DateTime } from 'luxon'
import { BaseModel, belongsTo, hasMany, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import EventQuiz from '#models/event_quiz'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare content: string | null

  @column()
  declare eventType: string

  @column()
  declare status: string

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime

  @column.dateTime()
  declare registrationDeadline: DateTime | null

  @column()
  declare venue: string | null

  @column()
  declare address: string | null

  @column()
  declare onlineLink: string | null

  @column()
  declare isOnline: boolean

  @column()
  declare isFree: boolean

  @column()
  declare price: number | null

  @column()
  declare currency: string

  @column()
  declare maxParticipants: number | null

  @column()
  declare currentParticipants: number

  @column()
  declare imageUrl: string | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => EventQuiz)
  declare quizzes: HasMany<typeof EventQuiz>

  // Manual soft delete implementation
  async delete() {
    this.deletedAt = DateTime.now()
    await this.save()
  }
}
