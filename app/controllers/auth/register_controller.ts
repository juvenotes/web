import WebRegister from '#actions/auth/http/web_register'
import SendVerificationEmail from '#actions/auth/registration_emails/send_verification_email'
import { SESSION_KEYS } from '#constants/session'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  @inject()
  async store({ request, response, session, logger }: HttpContext, webRegister: WebRegister) {
    try {
      const data = await request.validateUsing(registerValidator)
      const { user } = await webRegister.handle({ data })

      try {
        // Store return URL through verification flow
        const returnTo = session.get(SESSION_KEYS.RETURN_TO)
        if (returnTo) {
          session.put('post_verify_return', returnTo)
        }

        await SendVerificationEmail.handle({ user })
        session.flash('success', 'Please check your email to verify your account')
      } catch (emailError) {
        logger.error('Failed to send verification email', {
          context: 'user_registration',
          userId: user.id,
          userEmail: user.email,
          error: emailError instanceof Error ? emailError.message : emailError,
          stack: emailError instanceof Error ? emailError.stack : undefined,
        })
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
      logger.error('User registration failed', {
        context: 'user_registration',
        requestData: request.all(),
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      })
      session.flash('error', 'Registration failed. Please try again.')
      return response.redirect().back()
    }
  }
}
