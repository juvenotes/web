import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { Role } from '#enums/roles'

export default class GoogleSignupController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async handleCallback({ ally, auth, response, session }: HttpContext) {
    try {
      const google = ally.use('google')

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
      console.log(googleUser)
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
        text: `Welcome ${user.email}`,
      })
      return response.redirect().toPath('/')
    } catch (error) {
      console.error('Google auth error:', error)
      session.flash('message', {
        type: 'error',
        text: 'Authentication failed',
      })
      return response.redirect().toRoute('/')
    }
  }
}
