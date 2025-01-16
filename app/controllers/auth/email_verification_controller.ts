import SendVerificationEmail from '#actions/auth/registration_emails/send_verification_email'
import EmailVerification from '#models/email_verification'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import { DateTime } from 'luxon'

export default class VerificationController {
  async pending({ inertia, session, response }: HttpContext) {
    const email = session.get('pending_verification_email')
    if (!email) {
      return response.redirect().toPath('/register')
    }
    return inertia.render('auth/verify_email', { email })
  }

  async resend({ session, response }: HttpContext) {
    const email = session.get('pending_verification_email')
    if (!email) {
      session.flash('error', 'No pending verification found')
      return response.redirect().back()
    }

    try {
      const user = await User.findByOrFail('email', email)
      await SendVerificationEmail.handle({ user })

      session.flash('success', 'Verification email sent')
      return response.redirect().back()
    } catch (error) {
      console.error('Resend verification failed:', error, {
        email,
        timestamp: new Date().toISOString(),
      })
      session.flash('error', 'Could not send verification email')
      return response.redirect().back()
    }
  }

  async verify({ params, response, auth, session }: HttpContext) {
    try {
      const decrypted = encryption.decrypt(params.token)
      if (typeof decrypted !== 'string') {
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

      session.flash('success', 'Email verified successfully!')
      return response.redirect().toPath('/learn')
    } catch (error) {
      console.error('Verification error:', {
        error,
        token: params.token,
        timestamp: new Date().toISOString(),
      })
      session.flash('error', 'Invalid or expired verification link. Try again')
      return response.redirect().toPath('/auth/verify')
    }
  }
}
