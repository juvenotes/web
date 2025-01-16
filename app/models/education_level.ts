import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserEducationEntry from './user_education_entry.js'

export default class EducationLevel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @hasMany(() => UserEducationEntry)
  declare userEducationEntries: HasMany<typeof UserEducationEntry>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
