import mail from '@adonisjs/mail/services/main'
import User from '#models/user'

type Params = {
  user: User
}

export default class SendWelcomeEmail {
  static async handle({ user }: Params) {
    await mail.send((message) => {
      message
        .to(user.email)
        .from('noreply@juvenotes.com')
        .subject('Welcome to Juvenotes!')
        .htmlView('emails/welcome', { user })
    })
  }
}
