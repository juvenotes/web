import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MediaAsset extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  public hintId!: string

  @column()
  public hrefValue!: string

  @column()
  public originalMediaUrl?: string | null

  @column()
  public mediaName!: string

  @column()
  public mediaType!: 'IMAGE' | 'VIDEO' | 'HTML' | 'AUDIO' | 'OTHER'

  @column()
  public mimeType!: string

  @column()
  public cloudinaryUrl?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
