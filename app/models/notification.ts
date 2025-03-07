import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import NotificationType from '#enums/notification_types'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare initiatorUserId: number | null

  @column()
  declare notificationType: number

  /**
   * Table name for the related entity (e.g., 'questions', 'feedback')
   * Used with relatedId for polymorphic relationships
   */
  @column()
  declare relatedTable: string | null

  /**
   * ID of the related entity in the relatedTable
   */
  @column()
  declare relatedId: number | null

  @column()
  declare title: string

  /**
   * Detailed content of the notification
   */
  @column()
  declare body: string | null

  /**
   * Direct URL for navigation when clicked
   */
  @column()
  declare href: string | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime()
  declare actionedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'initiatorUserId',
  })
  declare initiator: BelongsTo<typeof User>

  @computed()
  get isRead(): boolean {
    return !!this.readAt
  }

  @computed()
  get isActioned(): boolean {
    return !!this.actionedAt
  }

  /**
   * Get the type name of this notification
   */
  @computed()
  get typeName(): string {
    return NotificationType[this.notificationType] || 'UNKNOWN'
  }
}
