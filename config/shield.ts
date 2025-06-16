import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
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
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://fonts.bunny.net',
      ],
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
        'https://res.cloudinary.com/', // Cloudinary for media assets
      ],
      frameSrc: [
        "'self'",
        '*.youtube.com',
        'www.youtube.com',
        'https://tally.so',
        'https://res.cloudinary.com',
      ],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://fonts.bunny.net'],
      mediaSrc: ["'self'", 'data:', '*'],
    },
    reportOnly: false,
  },

  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
