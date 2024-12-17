import { updateProfileValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async index({ inertia }: HttpContext) {
    return inertia.render('settings/profile')
  }

  async update({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator)
    const user = auth.use('web').user!

    await user.merge(data).save()
    session.flash('success', 'Your profile has been updated')
    return response.redirect().back()
  }
}
