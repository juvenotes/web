import ResetPassword from '#actions/auth/password_reset/reset_password'
import TrySendPasswordResetEmail from '#actions/auth/password_reset/try_send_password_reset_email'
import VerifyPasswordResetToken from '#actions/auth/password_reset/verify_password_reset_token'
import { passwordResetSendValidator, passwordResetValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import type { LoggerService } from '@adonisjs/core/logger'

export default class ForgotPasswordsController {
  #sentSessionKey = 'FORGOT_PASSWORD_SENT'

  constructor(protected logger: LoggerService) {}

  async index({ inertia, session }: HttpContext) {
    const isSent = session.flashMessages.has(this.#sentSessionKey)
    this.logger.info('Rendering forgot password page')
    return inertia.render('auth/forgot_password/index', { isSent })
  }

  async send({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(passwordResetSendValidator)
    this.logger.info('Attempting to send password reset email', { email: data.email })

    await TrySendPasswordResetEmail.handle(data)

    session.flash(this.#sentSessionKey, true)
    this.logger.info('Password reset email sent successfully', { email: data.email })

    return response.redirect().back()
  }

  async reset({ params, inertia }: HttpContext) {
    this.logger.info('Verifying password reset token')
    const { isValid, user } = await VerifyPasswordResetToken.handle({
      encryptedValue: params.value,
    })

    this.logger.info('Token verification result', { isValid, email: user?.email })
    return inertia.render('auth/forgot_password/reset', {
      value: params.value,
      email: user?.email,
      isValid,
    })
  }

  async update({ request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(passwordResetValidator)
    this.logger.info('Resetting password for user')

    const user = await ResetPassword.handle({ data })
    await auth.use('web').login(user)

    session.flash('success', 'Your password has been updated')
    this.logger.info('Password reset successful', { userId: user.id })

    return response.redirect().toPath('/')
  }
}
