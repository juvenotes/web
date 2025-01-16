import WebLogin from '#actions/auth/http/web_login'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { Logger } from '@adonisjs/core/logger'

export default class LoginController {
  @inject()
  async show({ inertia, logger }: HttpContext & { logger: Logger }) {
    logger.info('Displaying login page')
    return inertia.render('auth/login')
  }

  @inject()
  async store(
    { request, response, session, logger }: HttpContext & { logger: Logger },
    webLogin: WebLogin
  ) {
    try {
      const data = await request.validateUsing(loginValidator)
      logger.info('Login validation passed')

      await webLogin.handle({ data })
      logger.info('Login successful')

      session.flash('success', 'Welcome back to Juvenotes')
      return response.redirect().toPath('/learn')
    } catch (error) {
      logger.error({ err: error }, 'Login failed')
      throw error
    }
  }
}
