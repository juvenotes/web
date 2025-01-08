import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import mdx from '@mdx-js/rollup'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
    {
      enforce: 'pre',
      ...mdx({
        /* jsxImportSource: …, otherOptions… */
      }),
    },
    react(),
    adonisjs({ entrypoints: ['inertia/app/app.tsx'], reload: ['resources/views/**/*.edge'] }),
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.ts' } }),
    vue(),
    adonisjs({ entrypoints: ['inertia/app/app.ts'], reload: ['resources/views/**/*.edge'] }),
    Components({
      dirs: ['inertia/components'],
      dts: true,
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },

  /**
   * Define aliases for importing modules from
   * your frontend code
   * for example
   * import Header from `~/components/Button.tsx`
   */
  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
      '@': path.resolve(import.meta.dirname, './inertia'),
    },
  },
})
