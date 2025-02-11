import { BaseModelDto } from '@adocasts.com/dto/base'
import Institution from '#models/institution'
import { InstitutionType } from '#enums/institution_type'
import { CountryCode } from '#enums/countries'
import CourseDto from '#dtos/course'
import InstitutionCoursesDto from '#dtos/institution_course'

export default class InstitutionDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare institutionType: InstitutionType | null
  declare branch: string | null
  declare countryCode: CountryCode
  declare isActive: boolean
  declare courses: CourseDto[]
  declare institutionCourses: InstitutionCoursesDto[]
  declare createdAt: string
  declare updatedAt: string

  constructor(institution?: Institution) {
    super()

    if (!institution) return
    this.id = institution.id
    this.name = institution.name
    this.institutionType = institution.institutionType
    this.branch = institution.branch
    this.countryCode = institution.countryCode
    this.isActive = institution.isActive
    this.courses = CourseDto.fromArray(institution.courses)
    this.institutionCourses = InstitutionCoursesDto.fromArray(institution.institutionCourses)
    // this.createdAt = institution.createdAt.toISO()!
    // this.updatedAt = institution.updatedAt.toISO()!
  }
}
