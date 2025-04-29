import { BaseModelDto } from '@adocasts.com/dto/base'
import Institution from '#models/institution'
import CourseDto from '#dtos/course'

export default class InstitutionDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare createdAt: string
  declare updatedAt: string
  declare courses: CourseDto[]

  constructor(institution?: Institution) {
    super()

    if (!institution) return
    this.id = institution.id
    this.name = institution.name
    this.createdAt = institution.createdAt.toISO()!
    this.updatedAt = institution.updatedAt.toISO()!
    this.courses = CourseDto.fromArray(institution.courses)
  }
}