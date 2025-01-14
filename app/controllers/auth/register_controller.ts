import WebRegister from '#actions/auth/http/web_register'
import SendVerificationEmail from '#actions/auth/registration_emails/send_verification_email'
// import SendWelcomeEmail from '#actions/auth/registration_emails/send_welcome_email'
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

      try {
        await SendVerificationEmail.handle({ user })
        session.put('pending_verification_email', user.email)
        session.flash('success', 'Please check your email to verify your account')
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        session.flash(
          'warning',
          'Account created but verification email could not be sent. Please contact support.'
        )
        return response.redirect().toPath('/auth/verify')
      }

      session.put('pending_verification_email', user.email)

      session.flash('success', 'Please check your email to verify your account')
      return response.redirect().toPath('/auth/verify')
    } catch (error) {
      console.error('Registration error:', {
        error,
        data: request.all(),
        timestamp: new Date().toISOString(),
      })
      session.flash('error', 'Registration failed. Please try again.')
      return response.redirect().back()
    }
  }
}
