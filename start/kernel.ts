/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

// import { StatsigService } from '#services/statsig'
import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

// class StatsigInitMiddleware {
//   async handle(_: HttpContext, next: NextFn) {
//     await StatsigService.init()
//     return next()
//   }
// }

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('@foadonis/maintenance/maintenance_middleware'),
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/static/static_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
  () => import('@adonisjs/vite/vite_middleware'),
  () => import('@adonisjs/inertia/inertia_middleware'),
  // () => ({ default: StatsigInitMiddleware }),
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
  () => import('#middleware/initialize_bouncer_middleware'),
  () => import('#middleware/statsig_middleware'),
  // () => import('#middleware/experiment_middleware')
])

// process.on('SIGTERM', async () => {
//   await StatsigService.shutdown()
//   process.exit(0)
// })

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  verifyEmail: () => import('#middleware/verify_email_middleware'),
  guest: () => import('#middleware/guest_middleware'),
  auth: () => import('#middleware/auth_middleware'),
})
