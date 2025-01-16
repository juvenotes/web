import UserDto from '#dtos/user'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) => {
      const user = ctx.auth.use('web').user
      return user && new UserDto(user)
    },
    errors: (ctx) => {
      const errors = ctx.session?.flashMessages.get('errors') ?? {}
      return Object.keys(errors).reduce(
        (obj, key) => ({
          ...obj,
          [key]: errors[key].join(', '),
        }),
        {}
      )
    },
    exceptions: (ctx) => ctx.session.flashMessages.get('errorsBag') ?? {},
    messages: (ctx) => ctx.session.flashMessages.all() ?? {},
    features: async (ctx) => {
      const user = ctx.auth.use('web').user
      if (!user) return null

      const flags = await StatsigService.getFeatures(user.id.toString())
      return new FeatureFlagsDto(flags)
    },
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.ts',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
