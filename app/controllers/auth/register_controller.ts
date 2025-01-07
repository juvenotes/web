import WebRegister from '#actions/auth/http/web_register'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  @inject()
  async store({ request, response, session }: HttpContext, webRegister: WebRegister) {
    try {
      console.log('Received registration data:', request.all()) // Debug incoming data

      const data = await request.validateUsing(registerValidator)
      console.log('Validated data:', data) // Debug validated data

      const { user } = await webRegister.handle({ data })
      console.log('Created user:', user) // Debug created user

      session.flash('success', 'Welcome to Juvenotes my friend')
      return response.redirect().toRoute('/learn')
    } catch (error) {
      console.error('Registration error:', error) // Debug errors
      throw error
    }
  }
}
