import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { Role } from '#enums/roles'
import logger from '@adonisjs/core/services/logger'
import sendWelcomeEmail from '#actions/auth/registration_emails/send_welcome_email'

export default class GoogleSignupController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async handleCallback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')
    let userEmail: string | undefined

    try {
      if (google.accessDenied()) {
        session.flash('error', 'You have cancelled the login process')
        return response.redirect().toRoute('login')
      }

      if (google.stateMisMatch()) {
        session.flash('error', 'We are unable to verify the request. Please try again')
        return response.redirect().toRoute('login')
      }

      if (google.hasError()) {
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
        logger.info({ email: userEmail }, 'Sent welcome email')
      } catch (emailError) {
        logger.error({ err: emailError, email: userEmail }, 'Failed to send welcome email')
      }

      session.flash(
        'success',
        `Welcome ${user.fullName}! You've successfully logged in with Google.`
      )
      return response.redirect().toPath('/')
    } catch (error) {
      logger.error({ err: error, email: userEmail }, 'Failed to authenticate with Google')
      session.flash(
        'error',
        'Authentication failed. Please try again later. If the problem persists, contact support.'
      )
      return response.redirect().toRoute('/')
    }
  }
}
