import { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async handle({ inertia, logger, auth }: HttpContext) {
    logger.info('Rendering dashboard', {
      controller: 'DashboardController',
      action: 'handle',
      view: 'dashboard',
      userId: auth.user?.id,
    })

    return inertia.render('dashboard')
  }
}
