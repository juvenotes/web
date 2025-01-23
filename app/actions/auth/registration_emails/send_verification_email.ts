import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import string from '@adonisjs/core/helpers/string'
import encryption from '@adonisjs/core/services/encryption'
import env from '#start/env'
import { DateTime } from 'luxon'

type Params = {
  user: User
}

export default class SendVerificationEmail {
  static async handle({ user }: Params) {
    const token = string.generateRandom(32)
    const encryptedToken = encryption.encrypt(token)

    await user.related('emailVerification').create({
      token,
      expiresAt: DateTime.now().plus({ hours: 24 }),
    })

    const verificationUrl = `${env.get('APP_DOMAIN')}/auth/verify-email/${encryptedToken}`

    await mail.send((message) => {
      message
        .to(user.email)
        .from('noreply@juvenotes.com')
        .subject('Verify your Juvenotes account')
        .htmlView('emails/verify_email', {
          user,
          verificationUrl,
          expiresIn: '24 hours',
        })
    })
  }
}
