import WebLogout from '#actions/auth/http/web_logout'
import DestroyUserAccount from '#actions/settings/destroy_user_account'
import UpdateUserEmail from '#actions/settings/update_user_email'
import SessionLogDto from '#dtos/session_log'
import SessionService from '#services/session_service'
import { updateEmailValidator } from '#validators/settings'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class AccountsController {
  @inject()
  async index({ inertia, auth, response }: HttpContext, sessionService: SessionService) {
    if (!auth.user) {
      return response.redirect().toRoute('login.show')
    }

    // Get active sessions and convert to DTOs
    const sessions = await sessionService.getList(auth.user)
    const sessionDtos = sessions.map((session) => {
      // Mark current session
      session.isCurrentSession = session.token === sessionService.token

      // Convert to DTO
      return new SessionLogDto(session)
    })

    return inertia.render('settings/account', {
      user: auth.user,
      sessions: sessionDtos,
    })
  }

  async updateEmail({ request, response, session, auth, logger }: HttpContext) {
    const data = await request.validateUsing(updateEmailValidator)
    const user = await auth.use('web').user!

    logger.info('attempting to update user email', {
      userId: user.id,
      currentEmail: user.email,
      newEmail: data.email,
    })

    if (data.email === user.email) {
      logger.info('email update skipped - same email', {
        userId: user.id,
        email: user.email,
      })
      session.flash('success', 'You are already using the submitted email')
      return response.redirect().back()
    }

    await UpdateUserEmail.handle({ user, data })

    logger.info('email updated successfully', {
      userId: user.id,
      oldEmail: user.email,
      newEmail: data.email,
    })

    session.flash('success', 'Your email has been updated')

    return response.redirect().back()
  }

  @inject()
  async destroy({ request, response, session, auth }: HttpContext, webLogout: WebLogout) {
    const user = auth.use('web').user!
    const validator = vine.compile(
      vine.object({
        email: vine.string().in([user.email]),
      })
    )

    await request.validateUsing(validator)

    await DestroyUserAccount.handle({ user })

    await webLogout.handle()

    session.flash('success', 'Your account has been deleted')

    return response.redirect().toRoute('register.show')
  }
}
