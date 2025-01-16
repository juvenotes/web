import env from '#start/env'
import { defineConfig } from '@adonisjs/core/app'

interface StatsigConfig {
  key: string
  enabled: boolean
}

export default defineConfig<StatsigConfig>({
  key: env.get('STATSIG_CLIENT_KEY'), // Changed from clientKey to key
  enabled: env.get('NODE_ENV') === 'production',
})
