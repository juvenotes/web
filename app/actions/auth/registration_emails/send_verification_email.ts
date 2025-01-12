// import mail from '@adonisjs/mail/services/main'
// import User from '#models/user'
// import string from '@adonisjs/core/helpers/string'
// import encryption from '@adonisjs/core/services/encryption'
// import env from '#start/env'

// type Params = {
//   user: User
// }

// export default class SendVerificationEmail {
//   static async handle({ user }: Params) {
//     const token = string.generateRandom(32)
//     const encryptedToken = encryption.encrypt(token)

//     await user.related('emailVerification').create({
//       token,
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//     })

//     const verificationUrl = `${env.get('APP_URL')}/verify-email/${encryptedToken}`

//     await mail.send((message) => {
//       message
//         .to(user.email)
//         .from('noreply@juvenotes.com')
//         .subject('Verify your Juvenotes account')
//         .htmlView('emails/verify_email', { user, verificationUrl })
//     })
//   }
// }
