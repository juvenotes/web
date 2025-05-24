import { defineConfig, drivers } from '@foadonis/maintenance'

export default defineConfig({
  default: 'cache',
  drivers: {
    cache: drivers.cache(),
  },
})
