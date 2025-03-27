import SessionService from '#services/session_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class SessionCheckMiddleware {
  constructor(protected sessionService: SessionService) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response, auth } = ctx

    // Skip session checks for static assets and API routes
    if (
      request.url().startsWith('/assets/') ||
      request.url().startsWith('/api/') ||
      request.url().startsWith('/img/')
    ) {
      return next()
    }

    try {
      // Safely check if auth and auth.user exist
      if (!auth || !auth.user) {
        // Only clear cookie if sessionService is available
        if (this.sessionService && this.sessionService.getCookieName) {
          response.clearCookie(this.sessionService.getCookieName())
        }
        return next()
      }

      // Check the session status
      const user = auth.user
      const { isOk, log } = await this.sessionService.check(user)

      if (!isOk) {
        // Session is invalid (forced logout or expired)
        logger.info({
          message: 'Session invalidated during check',
          userId: user.id,
          sessionId: log?.id,
          reason: log?.forceLogout ? 'forced logout' : 'session expired',
        })

        await auth.use('web').logout()

        if (log) {
          log.logoutAt = DateTime.now()
          await log.save()
        }

        response.clearCookie(this.sessionService.getCookieName())
      }
    } catch (error) {
      // Log error but don't interrupt request flow
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Error in session check middleware'
      )
    }

    return next()
  }
}
