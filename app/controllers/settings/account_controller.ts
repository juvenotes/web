import { emailRule } from '#validators/auth'
import { updateEmailValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'

export default class AccountController {
  async index({ inertia }: HttpContext) {
    return inertia.render('settings/account')
  }

  async updateEmail({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(updateEmailValidator)
    const user = auth.use('web').user!

    if (data.email === user.email) {
      session.flash('success', 'You are already using the submitted email')
      return response.redirect().back()
    }

    await user.updateEmail(data)
    session.flash('success', 'Your email has been updated')
    return response.redirect().back()
  }

  async destroy({ request, response, auth, session }: HttpContext) {
    const user = auth.use('web').user!
    const validator = vine.compile(
      vine.object({
        confirmEmail: emailRule().in([user.email]),
      })
    )

    await validator.validate(request.all())

    await db.transaction(async (trx) => {
      user.useTransaction(trx)
      await user.delete()
    })

    await auth.use('web').logout()
    session.flash('success', 'Your account has been deleted')
    return response.redirect().toRoute('auth.register.show')
  }
}
