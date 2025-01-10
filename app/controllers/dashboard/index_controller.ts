import { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async handle({ inertia, bouncer }: HttpContext) {
    await bouncer.with('AdminDashboardPolicy').authorize('view')
    return inertia.render('dashboard')
  }
}
