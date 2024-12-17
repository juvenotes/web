import User from '#models/user'
import { loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login') //create this file @monari
  }

  async store({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(loginValidator)
    const user = await User.login(auth, data)
    const baseMessage = 'Welcome back'

    session.flash('success', user.fullName ? `${baseMessage}, ${user.fullName}` : baseMessage)

    return response.redirect().toRoute('/')
  }
}
