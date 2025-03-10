import transmit from '@adonisjs/transmit/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// Authorize user-specific channels
transmit.authorize<{ id: string }>('user/:id', (ctx: HttpContext, { id }) => {
  // Only allow users to subscribe to their own channel
  return ctx.auth.user?.id === +id
})
