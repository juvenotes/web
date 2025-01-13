import { HttpContext } from '@adonisjs/core/http'

export default class PrivacyController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('privacy')
  }
}
