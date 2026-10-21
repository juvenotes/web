import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { canManageAdmin } from '#abilities/main'

/**
 * Admin middleware denies access to non-admin users. It must run
 * after the auth middleware.
 *
 * Responds with 404 instead of 403 so the route's existence is
 * not disclosed to non-admins.
 */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (await ctx.bouncer.allows(canManageAdmin)) {
      return next()
    }

    return ctx.response.notFound()
  }
}
