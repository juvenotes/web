import { HttpContext } from '@adonisjs/core/http'

export default class TermsController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('terms')
  }
}
