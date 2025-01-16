import { initStatsig } from '#/services/statsig'
import { usePage } from '@inertiajs/vue3'
import type { Plugin } from 'vue'

export const StatsigPlugin: Plugin = {
  install: async () => {
    const page = usePage()
    const user = page.props.auth?.user

    if (import.meta.env.PROD) {
      await initStatsig(user?.id)
    }
  },
}
