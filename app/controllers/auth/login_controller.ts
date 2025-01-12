import WebLogin from '#actions/auth/http/web_login'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  @inject()
  async store({ request, response, session }: HttpContext, webLogin: WebLogin) {
    const data = await request.validateUsing(loginValidator)

    await webLogin.handle({ data })

    session.flash('success', 'Welcome back to Juvenotes')

    return response.redirect().toPath('/learn')
  }
}
