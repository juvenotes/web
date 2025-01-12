import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Course from './course.js'
import { InstitutionType } from '#enums/institution_type'
import { CountryCode } from '#enums/countries'

export default class Institution extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare institutionType: InstitutionType | null

  @column()
  declare branch: string | null

  @column()
  declare countryCode: CountryCode

  @column()
  declare isActive: boolean

  @manyToMany(() => Course, {
    pivotTable: 'institution_courses',
    pivotColumns: ['education_level_id', 'is_active'],
  })
  declare courses: ManyToMany<typeof Course>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
