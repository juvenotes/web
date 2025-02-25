import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import edge from 'edge.js'
import env from '#start/env'

export default class AccountListener {
  async onVerifyEmail({ user }: { user: User }) {
    let href = router.makeSignedUrl(
      'verification.email.verify',
      {
        email: user.email,
      },
      {
        expiresIn: '24h',
        purpose: 'email_verification',
      }
    )

    href = env.get('APP_DOMAIN') + href

    const html = await edge.render('emails/verify_email', { user, href })

    await mail.send((mailer) => {
      mailer.to(user.email).subject('[Juvenotes] Please verify your email').html(html)
    })
  }
}
