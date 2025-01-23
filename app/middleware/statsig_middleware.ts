// import { StatsigService } from '#services/statsig'
// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'
// import { InertiaSharedProps } from '@adonisjs/inertia/types'

// export default class StatsigMiddleware {
//   async handle(ctx: HttpContext, next: NextFn) {
//     const user = ctx.auth.user

//     if (user && 'inertia' in ctx) {
//       ctx.inertia.share({
//         features: {
//           newFeature: await StatsigService.checkGate(user.id.toString(), 'new_feature'),
//           betaAccess: await StatsigService.checkGate(user.id.toString(), 'beta_access'),
//         },
//       })
//     }

//     return next()
//   }
// }
