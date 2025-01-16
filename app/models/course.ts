import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Institution from './institution.js'
import EducationLevel from './education_level.js'

export default class Course extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Institution, {
    pivotTable: 'institution_courses',
    pivotColumns: ['education_level_id', 'is_active'],
  })
  declare institutions: ManyToMany<typeof Institution>

  @manyToMany(() => EducationLevel, {
    pivotTable: 'institution_courses',
    pivotForeignKey: 'course_id',
    pivotRelatedForeignKey: 'education_level_id',
  })
  declare educationLevels: ManyToMany<typeof EducationLevel>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
