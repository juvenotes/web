import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { Role } from '#enums/roles'
import sendWelcomeEmail from '#actions/auth/registration_emails/send_welcome_email'
import { SESSION_KEYS } from '#constants/session'
import { generateUsername } from '#utils/generate_username'
import { inject } from '@adonisjs/core'
import SessionService from '#services/session_service'

@inject()
export default class GoogleSignupController {
  constructor(protected sessionService: SessionService) {}

  private async handleLogin(
    existingUser: User,
    googleUser: any,
    { auth, response, session }: HttpContext
  ) {
    if (!existingUser.providerId) {
      existingUser.merge({
        provider: 'google',
        providerId: googleUser.id,
        avatar_url: googleUser.avatarUrl,
      })
      await existingUser.save()
    }

    await auth.use('web').login(existingUser)

    await this.sessionService.onSignInSuccess(existingUser, true)

    const returnTo = session.pull(SESSION_KEYS.RETURN_TO, '/learn')
    await session.regenerate()
    session.flash('success', `Welcome back ${existingUser.fullName}!`)
    return response.redirect().toPath(returnTo)
  }

  private async handleRegistration(
    googleUser: any,
    { auth, response, session, logger }: HttpContext
  ) {
    // Generate a unique username
    let username = generateUsername()
    let exists = true

    while (exists) {
      const existing = await User.findBy('username', username)
      if (!existing) {
        exists = false
      } else {
        username = generateUsername()
      }
    }

    const newUser = await User.create({
      email: googleUser.email,
      provider: 'google',
      providerId: googleUser.id,
      roleId: Role.USER,
      password: '',
      fullName: googleUser.name,
      avatar_url: googleUser.avatarUrl,
      username,
    })

    await auth.use('web').login(newUser)

    await this.sessionService.onSignInSuccess(newUser, true)

    const returnTo = session.pull(SESSION_KEYS.RETURN_TO, '/learn')
    await session.regenerate()

    try {
      await sendWelcomeEmail.handle({ user: newUser })
    } catch (error) {
      logger.error({ err: error, email: newUser.email }, 'Welcome email failed')
    }

    session.flash('success', `Welcome to Juvenotes, ${newUser.fullName}!`)
    return response.redirect().toPath(returnTo)
  }

  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async handleCallback(ctx: HttpContext) {
    const { ally, response, session, logger } = ctx
    const google = ally.use('google')
    const logContext = { provider: 'google', method: 'handleCallback' }

    try {
      if (google.accessDenied() || google.stateMisMatch() || google.hasError()) {
        logger.info(logContext, 'Google auth failed')
        session.flash('error', 'Authentication failed. Please try again.')
        return response.redirect().toRoute('/login')
      }

      const googleUser = await google.user()
      const existingUser = await User.findBy('email', googleUser.email)

      if (existingUser) {
        return this.handleLogin(existingUser, googleUser, ctx)
      }

      return this.handleRegistration(googleUser, ctx)
    } catch (error) {
      logger.error({ ...logContext, err: error }, 'Google auth error')
      session.flash('error', 'Authentication failed. Please try again.')
      return response.redirect().toRoute('login')
    }
  }
}
