import User from '#models/user'
import { registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register') //create this file @monari, inside pages
  }

  async store({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.register(auth, data)
    const baseMessage = `Welcome to ${app.appName}`

    session.flash('success', user.fullName ? `${baseMessage}, ${user.fullName}` : baseMessage)
    return response.redirect().toRoute('/')
  }
}
