import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import env from '#start/env'

type Params = {
  user: User
}

export default class SendWelcomeEmail {
  static async handle({ user }: Params) {
    // Get the base URL from environment variables
    const appUrl = env.get('APP_URL') || env.get('APP_DOMAIN') || 'https://juvenotes.com'

    await mail.send((message) => {
      message
        .to(user.email)
        .from('noreply@juvenotes.com')
        .subject('Welcome to Juvenotes!')
        .htmlView('emails/welcome', {
          user,
          app: { url: appUrl },
          logoUrl: `${appUrl}/images/logo.webp`,
        })
    })
  }
}
