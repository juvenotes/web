import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'http://www.freeprivacypolicy.com',
        'https://www.freeprivacypolicy.com',
        'https://umami.analytics.juvenotes.com',
        'https://plausible.analytics.juvenotes.com/',
        'http://plausible-ac0c0sw8kwws4sso0ggog0sg.20.164.19.119.sslip.io',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://cdn.tailwindcss.com',
        'https://cdn.jsdelivr.net',
        'https://*.statsig.com',
        'https://prodregistryv2.org',
        'https://cdn.brevo.com',
        'https://tally.so',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com https://fonts.bunny.net;'],
      imgSrc: ["'self'", 'data:', 'blob:', '*', 'https://www.brevo.com/'],
      connectSrc: [
        "'self'",
        'ws:',
        'wss:',
        'https://*.statsig.com',
        'https://prodregistryv2.org',
        'https://prodregistryv2.org/v1/rgstr',
        'https://umami.analytics.juvenotes.com/api/send',
        'https://plausible.analytics.juvenotes.com/',
        'https://*.brevo.com',
        'https://api.brevo.com',
        'https://tally.so',
      ],
      frameSrc: ["'self'", '*.youtube.com', 'www.youtube.com', 'https://tally.so'],
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
