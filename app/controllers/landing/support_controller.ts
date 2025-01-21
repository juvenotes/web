import type { HttpContext } from '@adonisjs/core/http'

export default class SupportController {
  async index({ inertia }: HttpContext) {
    return inertia.render('support/index', {
      title: 'Support',
      description: 'Contact support for assistance',
    })
  }
}
