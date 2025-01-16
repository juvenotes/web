import SendVerificationEmail from '#actions/auth/registration_emails/send_verification_email'
import EmailVerification from '#models/email_verification'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export default class VerificationController {
  async pending({ inertia, session, response }: HttpContext) {
    const email = session.get('pending_verification_email')
    if (!email) {
      logger.info('No pending verification email found, redirecting to register')
      return response.redirect().toPath('/register')
    }
    return inertia.render('auth/verify_email', { email })
  }

  async resend({ session, response }: HttpContext) {
    const email = session.get('pending_verification_email')
    if (!email) {
      logger.info('Resend attempted without pending email', {
        context: 'EmailVerification.resend',
      })
      session.flash('error', 'No pending verification found')
      return response.redirect().back()
    }

    try {
      const user = await User.findByOrFail('email', email)
      await SendVerificationEmail.handle({ user })

      logger.info('Verification email resent successfully', {
        context: 'EmailVerification.resend',
        email,
      })

      session.flash('success', 'Verification email sent')
      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to resend verification email', {
        error,
        context: 'EmailVerification.resend',
        email,
        timestamp: DateTime.now().toISO(),
      })

      session.flash('error', 'Could not send verification email')
      return response.redirect().back()
    }
  }

  async verify({ params, response, auth, session }: HttpContext) {
    try {
      const decrypted = encryption.decrypt(params.token)
      if (typeof decrypted !== 'string') {
        logger.warn('Invalid token format received', {
          context: 'EmailVerification.verify',
        })
        throw new Error('Invalid token format')
      }

      const verification = await EmailVerification.query()
        .where('token', decrypted)
        .where('expires_at', '>', DateTime.now().toSQL())
        .preload('user')
        .firstOrFail()

      const user = verification.user

      await user
        .merge({
          emailVerified: true,
          emailVerifiedAt: DateTime.now(),
        })
        .save()

      await verification.delete()
      await auth.use('web').login(user)

      logger.info('Email verified successfully', {
        context: 'EmailVerification.verify',
        userId: user.id,
      })

      session.flash('success', 'Email verified successfully!')
      return response.redirect().toPath('/learn')
    } catch (error) {
      logger.error('Email verification failed', {
        error,
        context: 'EmailVerification.verify',
        token: params.token,
        timestamp: DateTime.now().toISO(),
      })

      session.flash('error', 'Invalid or expired verification link. Try again')
      return response.redirect().toPath('/auth/verify')
    }
  }
}
