import { updateProfileValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async index({ inertia }: HttpContext) {
    return inertia.render('settings/profile')
  }

  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateProfileValidator(user.id))

    await user.merge(payload).save()
    session.flash('success', 'Your profile has been updated')
    return response.redirect().back()
  }
}
