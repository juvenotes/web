import { BaseModelDto } from '@adocasts.com/dto/base'
import Course from '#models/course'
import InstitutionDto from '#dtos/institution'
import EducationLevelDto from '#dtos/education_level'

export default class CourseDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare institutions: InstitutionDto[]
  declare educationLevels: EducationLevelDto[]
  declare createdAt: string
  declare updatedAt: string

  constructor(course?: Course) {
    super()

    if (!course) return
    this.id = course.id
    this.name = course.name
    this.institutions = InstitutionDto.fromArray(course.institutions)
    this.educationLevels = EducationLevelDto.fromArray(course.educationLevels)
    // this.createdAt = course.createdAt.toISO()!
    // this.updatedAt = course.updatedAt.toISO()!
  }
}
