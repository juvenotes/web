import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

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

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare metadata: Record<string, any>

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Manual soft delete implementation
  async delete() {
    this.deletedAt = DateTime.now()
    await this.save()
  }
}
