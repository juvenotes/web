import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MedicalArticle extends BaseModel {
  public static table = 'medical_articles'

  @column({ isPrimary: true })
  public pk_id!: number

  @column()
  public original_filename!: string

  @column()
  public article_id!: string

  @column()
  public article_name!: string

  @column()
  public library_id!: string

  @column()
  public keywords!: string

  @column()
  public full_data_content!: object

  @column.dateTime({ autoCreate: true })
  public imported_at!: DateTime
}
