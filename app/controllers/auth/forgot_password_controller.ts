import ResetPassword from '#actions/auth/password_reset/reset_password'
import TrySendPasswordResetEmail from '#actions/auth/password_reset/try_send_password_reset_email'
import VerifyPasswordResetToken from '#actions/auth/password_reset/verify_password_reset_token'
import { passwordResetSendValidator, passwordResetValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class ForgotPasswordsController {
  #sentSessionKey = 'FORGOT_PASSWORD_SENT'

  async index({ inertia, session, logger }: HttpContext) {
    const isSent = session.flashMessages.has(this.#sentSessionKey)
    logger.info('Rendering forgot password page', {
      context: 'forgot_password.index',
      passwordResetEmailSent: isSent,
    })
    return inertia.render('auth/forgot_password/index', { isSent })
  }

  async send({ request, response, session, logger }: HttpContext) {
    try {
      const data = await request.validateUsing(passwordResetSendValidator)
      const context = {
        controller: 'ForgotPasswordsController',
        action: 'send',
        email: data.email,
        message: 'Processing password reset request',
      }

      logger.info({ ...context })

      await TrySendPasswordResetEmail.handle(data)

      session.flash(this.#sentSessionKey, true)
      return response.redirect().back()
    } catch (error) {
      const context = {
        controller: 'ForgotPasswordsController',
        action: 'send',
        error: error as Error,
        message: 'Password reset request failed',
      }

      logger.error({ ...context })

      session.flash('error', 'Unable to process password reset request')
      return response.redirect().back()
    }
  }

  async reset({ params, inertia, logger }: HttpContext) {
    logger.info('Verifying password reset token', {
      context: 'forgot_password.reset',
      action: 'verify_token',
    })

    const { isValid, user } = await VerifyPasswordResetToken.handle({
      encryptedValue: params.value,
    })

    logger.info('Token verification completed', {
      context: 'forgot_password.reset',
      action: 'token_verified',
      isValid,
      email: user?.email,
    })

    return inertia.render('auth/forgot_password/show', {
      value: params.value,
      email: user?.email,
      isValid,
    })
  }

  async update({ request, response, session, auth, logger }: HttpContext) {
    const data = await request.validateUsing(passwordResetValidator)
    logger.info('Processing password reset update', {
      context: 'forgot_password.update',
      action: 'attempt_reset',
    })

    const user = await ResetPassword.handle({ data })
    await auth.use('web').login(user)

    session.flash('success', 'Your password has been updated')
    logger.info('Password reset completed successfully', {
      context: 'forgot_password.update',
      action: 'reset_complete',
      userId: user.id,
      email: user.email,
    })

    return response.redirect().toPath('/')
  }
}
