import User from '#models/user'
import string from '@adonisjs/core/helpers/string'
import encryption from '@adonisjs/core/services/encryption'
import ExpirePasswordResetTokens from './expire_password_reset_tokens.js'
import { DateTime } from 'luxon'
import router from '@adonisjs/core/services/router'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'

type Params = {
  email: string
}

export default class TrySendPasswordResetEmail {
  static async handle({ email }: Params) {
    logger.info('Attempting to send password reset email', { email })
    const user = await User.query().where({ email }).first()
    if (!user) {
      logger.info('No user found with email', { email })
      return
    }
    const value = string.generateRandom(32)
    const encryptedValue = encryption.encrypt(value)

    logger.info('Generated reset token', { email, value: encryptedValue })

    await ExpirePasswordResetTokens.handle({ user })
    await user.related('passwordResetTokens').create({
      value,
      expiresAt: DateTime.now().plus({ hour: 1 }),
    })

    const resetLink = router
      .builder()
      .prefixUrl(env.get('APP_DOMAIN'))
      .params({ value: encryptedValue })
      .make('forgot_password.reset')

    logger.info('Generated reset link', { email, resetLink })

    try {
      await mail.sendLater((message) => {
        message
          .subject('Reset Your Juvenotes Password')
          .to(user.email)
          .htmlView('emails/forgot_password', {
            user,
            resetLink,
          })
      })
      logger.info('Password reset email sent successfully', { email })
    } catch (error) {
      logger.error('Failed to send password reset email', {
        error,
        email,
        context: 'TrySendPasswordResetEmail',
      })
      throw error
    }
  }
}
