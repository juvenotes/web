import { BaseModelDto } from '@adocasts.com/dto/base'
import UserEducationEntry from '#models/user_education_entry'
import UserDto from '#dtos/user'
import EducationLevelDto from '#dtos/education_level'

export default class UserEducationEntryDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare institutionCourseId: number
  declare educationLevelId: number
  declare graduationYear: number
  declare user: UserDto | null
  declare educationLevel: EducationLevelDto | null
  declare createdAt: string
  declare updatedAt: string

  constructor(userEducationEntry?: UserEducationEntry) {
    super()

    if (!userEducationEntry) return
    this.id = userEducationEntry.id
    this.userId = userEducationEntry.userId
    this.institutionCourseId = userEducationEntry.institutionCourseId
    this.educationLevelId = userEducationEntry.educationLevelId
    this.graduationYear = userEducationEntry.graduationYear
    this.user = userEducationEntry.user && new UserDto(userEducationEntry.user)
    this.educationLevel =
      userEducationEntry.educationLevel && new EducationLevelDto(userEducationEntry.educationLevel)
    // this.createdAt = userEducationEntry.createdAt.toISO()!
    // this.updatedAt = userEducationEntry.updatedAt.toISO()!
  }
}
