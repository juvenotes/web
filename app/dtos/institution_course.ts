import { BaseModelDto } from '@adocasts.com/dto/base'
import InstitutionCourse from '#models/institution_course'
import InstitutionDto from '#dtos/institution'
import CourseDto from '#dtos/course'
import EducationLevelDto from '#dtos/education_level'
import UserEducationEntryDto from '#dtos/user_education_entry'

export default class InstitutionCourseDto extends BaseModelDto {
  declare id: number
  declare institutionId: number
  declare courseId: number
  declare educationLevelId: number
  declare isActive: boolean
  declare institution: InstitutionDto | null
  declare course: CourseDto | null
  declare educationLevel: EducationLevelDto | null
  declare userEducationEntries: UserEducationEntryDto[]
  // declare createdAt: string
  // declare updatedAt: string

  constructor(institutionCourse?: InstitutionCourse) {
    super()

    if (!institutionCourse) return
    this.id = institutionCourse.id
    this.institutionId = institutionCourse.institutionId
    this.courseId = institutionCourse.courseId
    this.educationLevelId = institutionCourse.educationLevelId
    this.isActive = institutionCourse.isActive
    this.institution =
      institutionCourse.institution && new InstitutionDto(institutionCourse.institution)
    this.course = institutionCourse.course && new CourseDto(institutionCourse.course)
    this.educationLevel =
      institutionCourse.educationLevel && new EducationLevelDto(institutionCourse.educationLevel)
    this.userEducationEntries = UserEducationEntryDto.fromArray(
      institutionCourse.userEducationEntries
    )
    // this.createdAt = institutionCourse.createdAt.toISO()!
    // this.updatedAt = institutionCourse.updatedAt.toISO()!
  }
}
