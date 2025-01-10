import { BaseModelDto } from '@adocasts.com/dto/base'
import User from '#models/user'
import { CountryCode } from '#enums/countries'
import RoleDto from '#dtos/role'
import EmailHistoryDto from '#dtos/email_history'
import PasswordResetTokenDto from '#dtos/password_reset_token'
import ConceptDto from '#dtos/concept'
import QuestionDto from '#dtos/question'
import PastPaperDto from '#dtos/past_paper'
import UserEducationEntryDto from '#dtos/user_education_entry'

export default class UserDto extends BaseModelDto {
  declare id: number
  declare roleId: number
  declare avatar_url: string | null
  declare fullName: string | null
  declare email: string
  declare password: string
  declare providerId: string
  declare provider: string
  declare total_study_time: number
  declare streak_count: number
  // declare last_login: string
  declare countryCode: CountryCode
  // declare createdAt: string
  // declare updatedAt: string | null
  declare role: RoleDto | null
  declare emailHistories: EmailHistoryDto[]
  declare passwordResetTokens: PasswordResetTokenDto[]
  declare concepts: ConceptDto[]
  declare questions: QuestionDto[]
  declare pastPapers: PastPaperDto[]
  declare userEducationEntries: UserEducationEntryDto[]

  constructor(user?: User) {
    super()

    if (!user) return
    this.id = user.id
    this.roleId = user.roleId
    this.avatar_url = user.avatar_url
    this.fullName = user.fullName
    this.email = user.email
    this.password = user.password
    this.providerId = user.providerId
    this.provider = user.provider
    this.total_study_time = user.total_study_time
    this.streak_count = user.streak_count
    // this.last_login = user.last_login.toISO()!
    this.countryCode = user.countryCode
    // this.createdAt = user.createdAt.toISO()!
    // this.updatedAt = user.updatedAt?.toISO()!
    this.role = user.role && new RoleDto(user.role)
    this.emailHistories = EmailHistoryDto.fromArray(user.emailHistories)
    this.passwordResetTokens = PasswordResetTokenDto.fromArray(user.passwordResetTokens)
    this.concepts = ConceptDto.fromArray(user.concepts)
    this.questions = QuestionDto.fromArray(user.questions)
    this.pastPapers = PastPaperDto.fromArray(user.pastPapers)
    this.userEducationEntries = UserEducationEntryDto.fromArray(user.userEducationEntries)
  }
}
