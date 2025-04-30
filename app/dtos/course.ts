import { BaseModelDto } from '@adocasts.com/dto/base'
import Course from '#models/course'
import EducationLevelDto from '#dtos/education_level'
import InstitutionDto from '#dtos/institution'

export default class CourseDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare educationLevelId: number
  declare createdAt: string
  declare updatedAt: string
  declare educationLevel: EducationLevelDto | null
  declare institutions: InstitutionDto[]

  constructor(course?: Course) {
    super()

    if (!course) return
    this.id = course.id
    this.name = course.name
    this.educationLevelId = course.educationLevelId
    this.createdAt = course.createdAt.toISO()!
    this.updatedAt = course.updatedAt.toISO()!
    this.educationLevel = course.educationLevel && new EducationLevelDto(course.educationLevel)
    this.institutions = InstitutionDto.fromArray(course.institutions)
  }
}