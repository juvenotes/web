import { updateProfileValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async index({ inertia }: HttpContext) {
    return inertia.render('settings/profile')
  }

  async update({ request, response, auth, session, logger }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateProfileValidator(user.id))

    logger.info('updating user profile', {
      userId: user.id,
      fullName: payload.fullName,
      username: payload.username,
    })

    await user.merge(payload).save()
    session.flash('success', 'Your profile has been updated. Please refresh the page')
    return response.redirect().back()
  }
}
