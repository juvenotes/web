import WebLogin from '#actions/auth/http/web_login'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  @inject()
  async show({ inertia, logger }: HttpContext) {
    const requestId = crypto.randomUUID()
    logger.info({ requestId, action: 'login.page.view' }, 'Displaying login page')
    return inertia.render('auth/login')
  }

  @inject()
  async store({ request, response, session, logger }: HttpContext, webLogin: WebLogin) {
    const requestId = crypto.randomUUID()
    try {
      logger.info({ requestId, action: 'login.validate' }, 'Validating login credentials')
      const data = await request.validateUsing(loginValidator)
      logger.info(
        { requestId, action: 'login.validate.success', email: data.email },
        'Login validation passed'
      )

      logger.info({ requestId, action: 'login.attempt', email: data.email }, 'Attempting login')
      await webLogin.handle({ data })
      logger.info({ requestId, action: 'login.success', email: data.email }, 'Login successful')

      session.flash('success', 'Welcome back to Juvenotes')
      return response.redirect().toPath('/learn')
    } catch (error) {
      logger.error(
        {
          requestId,
          action: 'login.error',
          err: error,
          email: request.input('email'),
        },
        'Login failed'
      )
      throw error
    }
  }
}
