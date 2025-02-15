import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'", '@viteDevUrl'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://www.freeprivacypolicy.com'],
      styleSrc: ["'self'", "'unsafe-inline'", '@viteDevUrl', 'https://fonts.bunny.net'],
      imgSrc: ["'self'", 'data:', 'blob:', '*'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      frameSrc: ["'self'", '*.youtube.com', 'www.youtube.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://fonts.bunny.net'],
      mediaSrc: ["'self'", 'data:', '*'],
    },
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
