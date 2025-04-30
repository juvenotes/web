import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { SESSION_KEYS } from '#constants/session'
import UserEnrollment from '#models/user_enrollment'

/**
 * Middleware to check if a user has completed onboarding
 * If not, they will be redirected to the onboarding page
 */
export default class OnboardingCheckMiddleware {
  /**
   * Handle the incoming request
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request, response, logger, session } = ctx

    // Skip middleware if user is not authenticated
    if (!auth.user) {
      return next()
    }

    // Check if the current path is already the onboarding path
    if (request.url().startsWith('/onboarding')) {
      return next()
    }

    try {
      // Check if user has completed onboarding
      const hasEnrollment = await UserEnrollment.query().where('userId', auth.user.id).first()

      // If the user has not completed onboarding, redirect to onboarding
      if (!hasEnrollment) {
        logger.info(
          {
            action: 'onboarding.required',
            userId: auth.user.id,
            originalUrl: request.url(),
          },
          'User redirected to required onboarding'
        )

        // Store the current URL as the return URL
        session.put(SESSION_KEYS.RETURN_TO, request.url())

        return response.redirect().toPath('/onboarding')
      }
    } catch (error) {
      logger.error(
        {
          action: 'onboarding.check.error',
          err: error,
          userId: auth.user.id,
        },
        'Error checking onboarding status'
      )

      // On error, allow request to continue to avoid blocking users unnecessarily
    }

    // User has completed onboarding, so proceed with the request
    await next()
  }
}
