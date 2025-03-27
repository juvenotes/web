import User from '#models/user'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import SessionService from '#services/session_service'

type Params = {
  data: Infer<typeof loginValidator>
}

@inject()
export default class WebLogin {
  constructor(
    protected ctx: HttpContext,
    protected sessionService: SessionService
  ) {}

  async handle({ data }: Params) {
    const user = await User.verifyCredentials(data.email, data.password)

    await this.ctx.auth.use('web').login(user, data.remember)

    // Track the session
    await this.sessionService.onSignInSuccess(user, !!data.remember)

    return user
  }
}
