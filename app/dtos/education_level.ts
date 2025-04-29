import { BaseModelDto } from '@adocasts.com/dto/base'
import EducationLevel from '#models/education_level'
import CourseDto from '#dtos/course'

export default class EducationLevelDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare createdAt: string
  declare updatedAt: string
  declare courses: CourseDto[]

  constructor(educationLevel?: EducationLevel) {
    super()

    if (!educationLevel) return
    this.id = educationLevel.id
    this.name = educationLevel.name
    this.createdAt = educationLevel.createdAt.toISO()!
    this.updatedAt = educationLevel.updatedAt.toISO()!
    this.courses = CourseDto.fromArray(educationLevel.courses)
  }
}