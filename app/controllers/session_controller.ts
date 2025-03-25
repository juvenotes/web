import SessionService from '#services/session_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SessionsController {
  constructor(protected sessionService: SessionService) {}

  async destroy({ response, params, session, auth }: HttpContext) {
    if (!auth.user) {
      return response.redirect().toRoute('login.show')
    }

    if (params.id) {
      await this.sessionService.onSignOutForce(auth.user, params.id)
      session.flash('success', 'Session has been terminated')
    } else {
      await this.sessionService.onSignOutForceAll(auth.user)
      session.flash('success', 'All other sessions have been terminated')
    }

    return response.redirect().back()
  }
}
