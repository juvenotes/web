import WebRegister from '#actions/auth/http/web_register'
import SendWelcomeEmail from '#actions/auth/registration_emails/send_welcome_email'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  @inject()
  async store({ request, response, session }: HttpContext, webRegister: WebRegister) {
    try {
      const data = await request.validateUsing(registerValidator)
      const { user } = await webRegister.handle({ data })

      await SendWelcomeEmail.handle({ user })

      session.flash('success', 'Welcome to Juvenotes! Check your email for next steps.')
      return response.redirect().toPath('/learn')
    } catch (error) {
      console.error('Registration error:', error)
      session.flash('error', 'Registration failed. Please try again.')
      return response.redirect().back()
    }
  }
}
