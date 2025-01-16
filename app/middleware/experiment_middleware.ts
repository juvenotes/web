import { StatsigService } from '#services/statsig'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ExperimentMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (user && 'inertia' in ctx) {
      // Get experiment assignments
      const uiExperiment = await StatsigService.getExperiment(user.id.toString(), 'ui_experiment')
      const onboardingLayer = await StatsigService.getLayer(user.id.toString(), 'onboarding_flow')

      // Share with frontend
      ctx.inertia.share({
        experiments: {
          uiVariant: uiExperiment.get('variant', 'control'),
          onboarding: {
            welcomeMessage: onboardingLayer.get('welcome_message', 'Welcome to Juvenotes!'),
            showTour: onboardingLayer.get('show_tour', false),
          },
        },
      })
    }

    return next()
  }
}
