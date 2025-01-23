import WebLogout from '#actions/auth/http/web_logout'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  @inject()
  async handle({ response, session, logger, auth }: HttpContext, webLogout: WebLogout) {
    const user = auth.user
    await webLogout.handle()

    logger.info('User logged out', {
      userId: user?.id,
      email: user?.email,
    })
    session.flash('success', 'Cya next time')

    return response.redirect().toRoute('/login')
  }
}
