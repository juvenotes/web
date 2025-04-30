import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import EmailHistory from '#models/email_history'
import Role from '#models/role'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import PasswordResetToken from './password_reset_token.js'
import Concept from './concept.js'
import Question from './question.js'
import PastPaper from './past_paper.js'

import { CountryCode } from '#enums/countries'
import EmailVerification from './email_verification.js'
import SessionLog from './session_log.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roleId: number

  @column()
  declare avatar_url: string | null

  @column()
  declare fullName: string | null

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare providerId: string

  @column()
  declare provider: string

  @column()
  declare personalization_complete: boolean

  @column()
  declare total_study_time: number

  @column()
  declare streak_count: number

  @column.dateTime()
  declare last_login: DateTime

  @column()
  declare countryCode: CountryCode

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare emailVerified: Boolean | null

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @hasOne(() => EmailVerification)
  declare emailVerification: HasOne<typeof EmailVerification>

  // @computed()
  // get isEmailVerified() {
  //   return this.emailVerified === this.email && this.emailVerifiedAt
  // }

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @hasMany(() => EmailHistory)
  declare emailHistories: HasMany<typeof EmailHistory>

  @hasMany(() => PasswordResetToken)
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>

  @hasMany(() => Concept)
  declare concepts: HasMany<typeof Concept>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @hasMany(() => PastPaper)
  declare pastPapers: HasMany<typeof PastPaper>

  @hasMany(() => SessionLog)
  declare sessions: HasMany<typeof SessionLog>
}
