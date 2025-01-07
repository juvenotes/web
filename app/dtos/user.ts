import { BaseModelDto } from '@adocasts.com/dto/base'
import User from '#models/user'
import RoleDto from '#dtos/role'
import EmailHistoryDto from '#dtos/email_history'
import PasswordResetTokenDto from '#dtos/password_reset_token'

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
  declare last_login: string
  declare createdAt: string
  declare updatedAt: string | null
  declare role: RoleDto | null
  declare emailHistories: EmailHistoryDto[]
  declare passwordResetTokens: PasswordResetTokenDto[]

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
    this.last_login = user.last_login.toISO()!
    this.createdAt = user.createdAt.toISO()!
    this.updatedAt = user.updatedAt?.toISO()!
    this.role = user.role && new RoleDto(user.role)
    this.emailHistories = EmailHistoryDto.fromArray(user.emailHistories)
    this.passwordResetTokens = PasswordResetTokenDto.fromArray(user.passwordResetTokens)
  }
}
