import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { Role } from '#enums/roles'
import sendWelcomeEmail from '#actions/auth/registration_emails/send_welcome_email'

export default class GoogleSignupController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async handleCallback({ ally, auth, response, session, logger }: HttpContext) {
    const google = ally.use('google')
    let userEmail: string | undefined
    const logContext = { provider: 'google', method: 'handleCallback' }

    try {
      if (google.accessDenied()) {
        logger.info(
          { ...logContext, reason: 'access_denied' },
          'User cancelled Google authentication'
        )
        session.flash('error', 'You have cancelled the login process')
        return response.redirect().toRoute('login')
      }

      if (google.stateMisMatch()) {
        logger.warn(
          { ...logContext, reason: 'state_mismatch' },
          'Google auth state mismatch detected'
        )
        session.flash('error', 'We are unable to verify the request. Please try again')
        return response.redirect().toRoute('login')
      }

      if (google.hasError()) {
        logger.error(
          { ...logContext, reason: 'provider_error', error: google.getError() },
          'Google authentication error'
        )
        session.flash('error', google.getError() || 'Authentication failed')
        return response.redirect().toRoute('login')
      }

      const googleUser = await google.user()
      userEmail = googleUser.email
      const user = await User.firstOrCreate({
        email: googleUser.email,
        provider: 'google',
        providerId: googleUser.id,
        roleId: Role.USER,
        password: '',
        fullName: googleUser.name,
        avatar_url: googleUser.avatarUrl,
      })

      await auth.use('web').login(user)

      try {
        await sendWelcomeEmail.handle({ user })
        logger.info(
          { ...logContext, email: userEmail, userId: user.id },
          'Welcome email sent successfully'
        )
      } catch (emailError) {
        logger.error(
          { ...logContext, err: emailError, email: userEmail, userId: user.id },
          'Failed to send welcome email'
        )
      }

      session.flash(
        'success',
        `Welcome ${user.fullName}! You've successfully logged in with Google.`
      )
      return response.redirect().toPath('/')
    } catch (error) {
      logger.error(
        {
          ...logContext,
          err: error,
          email: userEmail,
          step: 'authentication',
        },
        'Google authentication failed'
      )
      session.flash(
        'error',
        'Authentication failed. Please try again later. If the problem persists, contact support.'
      )
      return response.redirect().toRoute('/')
    }
  }
}
