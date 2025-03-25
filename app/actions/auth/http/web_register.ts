import { Role } from '#enums/roles'
import User from '#models/user'
import { generateUsername } from '#utils/generate_username'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import SessionService from '#services/session_service'

type Params = {
  data: Infer<typeof registerValidator>
}

@inject()
export default class WebRegister {
  constructor(
    protected ctx: HttpContext,
    protected sessionService: SessionService
  ) {}

  async handle({ data }: Params) {
    let username = generateUsername()
    let exists = true

    while (exists) {
      const existing = await User.findBy('username', username)
      if (!existing) {
        exists = false
      } else {
        username = generateUsername()
      }
    }

    const user = await User.create({
      ...data,
      username,
      roleId: Role.USER,
    })

    // Note: don't track session here since the user typically needs to verify email first
    // Session will be tracked upon first login

    return { user }
  }
}
