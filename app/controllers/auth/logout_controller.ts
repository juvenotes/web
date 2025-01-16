import WebLogout from '#actions/auth/http/web_logout'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { Logger } from '@adonisjs/core/logger'

export default class LogoutController {
  @inject()
  async handle({ response, session, logger }: HttpContext, webLogout: WebLogout) {
    await webLogout.handle()

    logger.info('User logged out successfully')
    session.flash('success', 'Cya next time')

    return response.redirect().toRoute('/login')
  }
}
