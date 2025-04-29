import { BaseModelDto } from '@adocasts.com/dto/base'
import InstitutionCourse from '#models/institution_course'
import InstitutionDto from '#dtos/institution'
import CourseDto from '#dtos/course'
import UserEnrollmentDto from '#dtos/user_enrollment'

export default class InstitutionCourseDto extends BaseModelDto {
  declare id: number
  declare institutionId: number
  declare courseId: number
  declare createdAt: string
  declare updatedAt: string
  declare institution: InstitutionDto | null
  declare course: CourseDto | null
  declare userEnrollments: UserEnrollmentDto[]

  constructor(institutionCourse?: InstitutionCourse) {
    super()

    if (!institutionCourse) return
    this.id = institutionCourse.id
    this.institutionId = institutionCourse.institutionId
    this.courseId = institutionCourse.courseId
    this.createdAt = institutionCourse.createdAt.toISO()!
    this.updatedAt = institutionCourse.updatedAt.toISO()!
    this.institution = institutionCourse.institution && new InstitutionDto(institutionCourse.institution)
    this.course = institutionCourse.course && new CourseDto(institutionCourse.course)
    this.userEnrollments = UserEnrollmentDto.fromArray(institutionCourse.userEnrollments)
  }
}