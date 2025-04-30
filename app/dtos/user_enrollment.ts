import { BaseModelDto } from '@adocasts.com/dto/base'
import UserEnrollment from '#models/user_enrollment'
import UserDto from '#dtos/user'
import InstitutionCourseDto from '#dtos/institution_course'

export default class UserEnrollmentDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare institutionCourseId: number
  declare graduationYear: number | null
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare institutionCourse: InstitutionCourseDto | null

  constructor(userEnrollment?: UserEnrollment) {
    super()

    if (!userEnrollment) return
    this.id = userEnrollment.id
    this.userId = userEnrollment.userId
    this.institutionCourseId = userEnrollment.institutionCourseId
    this.graduationYear = userEnrollment.graduationYear
    this.createdAt = userEnrollment.createdAt.toISO()!
    this.updatedAt = userEnrollment.updatedAt.toISO()!
    this.user = userEnrollment.user && new UserDto(userEnrollment.user)
    this.institutionCourse =
      userEnrollment.institutionCourse && new InstitutionCourseDto(userEnrollment.institutionCourse)
  }
}
