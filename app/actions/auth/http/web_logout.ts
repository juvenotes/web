import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import SessionService from '#services/session_service'

@inject()
export default class WebLogout {
  constructor(
    protected ctx: HttpContext,
    protected sessionService: SessionService
  ) {}

  async handle() {
    const user = this.ctx.auth.use('web').user

    if (user) {
      await this.sessionService.onSignOutSuccess(user)
    }

    await this.ctx.auth.use('web').logout()
  }
}
