import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { Role } from '#enums/roles'
import Logger from '@adonisjs/core/logger'

export default class GoogleSignupController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async handleCallback({ ally, auth, response, session, logger }: HttpContext) {
    const google = ally.use('google')

    try {
      if (google.accessDenied()) {
        session.flash('message', {
          type: 'error',
          text: 'You have cancelled the login process',
        })
        return response.redirect().toRoute('login')
      }

      if (google.stateMisMatch()) {
        session.flash('message', {
          type: 'error',
          text: 'We are unable to verify the request. Please try again',
        })
        return response.redirect().toRoute('login')
      }

      if (google.hasError()) {
        session.flash('message', {
          type: 'error',
          text: google.getError() || 'Authentication failed',
        })
        return response.redirect().toRoute('login')
      }

      const googleUser = await google.user()
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

      session.flash('message', {
        type: 'success',
        text: `Welcome back, ${user.fullName}! You've successfully logged in with Google.`,
      })
      return response.redirect().toPath('/')
    } catch (error) {
      logger.error({ err: error, email: google.user?.email }, 'Failed to authenticate with Google')
      session.flash('message', {
        type: 'error',
        text: 'Authentication failed. Please try again later.',
      })
      return response.redirect().toRoute('/')
    }
  }
}
