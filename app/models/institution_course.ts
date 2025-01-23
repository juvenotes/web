import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InstitutionCourse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare institutionId: number

  @column()
  declare courseId: number

  @column()
  declare educationLevelId: number

  @column()
  declare isActive: boolean
}
