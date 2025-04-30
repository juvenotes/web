import WebLogin from '#actions/auth/http/web_login'
import { SESSION_KEYS } from '#constants/session'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import UserEnrollment from '#models/user_enrollment'

export default class LoginController {
  @inject()
  async show({ inertia, logger }: HttpContext) {
    const requestId = crypto.randomUUID()
    logger.info({ requestId, action: 'login.page.view' }, 'Displaying login page')
    return inertia.render('auth/login')
  }

  @inject()
  async store({ request, response, session, logger, auth }: HttpContext, webLogin: WebLogin) {
    const requestId = crypto.randomUUID()
    try {
      const data = await request.validateUsing(loginValidator)
      await webLogin.handle({ data })

      // Store intended destination URL in session
      const returnTo = session.get(SESSION_KEYS.RETURN_TO, '/learn')

      // Check if the user has completed onboarding
      if (auth.user) {
        try {
          const hasEnrollment = await UserEnrollment.query().where('userId', auth.user.id).first()

          // If user has no enrollment data, redirect to onboarding as a required step
          // Keep the original return URL in session for after onboarding
          if (!hasEnrollment) {
            logger.info(
              {
                requestId,
                action: 'login.redirect.onboarding',
                userId: auth.user.id,
                returnTo,
              },
              'Redirecting to required onboarding'
            )
            return response.redirect().toPath('/onboarding')
          }
        } catch (error) {
          logger.error(
            {
              requestId,
              action: 'login.enrollment-check.error',
              err: error,
              userId: auth.user.id,
            },
            'Error checking user enrollment status'
          )
          // For errors, still redirect to onboarding as a safeguard
          return response.redirect().toPath('/onboarding')
        }
      }

      logger.info(
        {
          requestId,
          action: 'login.redirect',
          returnTo,
          email: data.email,
        },
        'Processing login redirect'
      )

      // Only reach here if user has completed onboarding
      // Pull the return URL from session and redirect
      session.pull(SESSION_KEYS.RETURN_TO)
      await session.regenerate()
      session.flash('success', 'Welcome back to Juvenotes')

      return response.redirect().toPath(returnTo)
    } catch (error) {
      logger.error(
        {
          requestId,
          action: 'login.error',
          err: error,
        },
        'Login failed'
      )
      throw error
    }
  }
}
