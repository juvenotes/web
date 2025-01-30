import env from '#start/env'
import { defineConfig, engines } from '@foadonis/magnify'

const magnifyConfig = defineConfig({
  default: 'meilisearch',
  engines: {
    meilisearch: engines.meilisearch({
      host: `http://${env.get('MEILISEARCH_HOST')}`,
      apiKey: env.get('MEILISEARCH_API_KEY'),
      indexSettings: {
        concepts: {
          filterableAttributes: ['isTerminal'],
          sortableAttributes: ['createdAt', 'title'],
        },
      },
    }),
  },
})

export default magnifyConfig

/**
 * Inferring types for the list of hashers you have configured
 * in your application.
 */
declare module '@foadonis/magnify/types' {
  export interface EnginesList extends InferEngines<typeof magnifyConfig> {}
}
