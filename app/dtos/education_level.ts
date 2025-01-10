import { BaseModelDto } from '@adocasts.com/dto/base'
import EducationLevel from '#models/education_level'
import UserEducationEntryDto from '#dtos/user_education_entry'

export default class EducationLevelDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare userEducationEntries: UserEducationEntryDto[]
  declare createdAt: string
  declare updatedAt: string

  constructor(educationLevel?: EducationLevel) {
    super()

    if (!educationLevel) return
    this.id = educationLevel.id
    this.name = educationLevel.name
    this.userEducationEntries = UserEducationEntryDto.fromArray(educationLevel.userEducationEntries)
    // this.createdAt = educationLevel.createdAt.toISO()!
    // this.updatedAt = educationLevel.updatedAt.toISO()!
  }
}
