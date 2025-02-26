import { Role } from '#enums/roles'
import User from '#models/user'
import { generateUsername } from '#utils/generate_username'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Params = {
  data: Infer<typeof registerValidator>
}

@inject()
export default class WebRegister {
  constructor(protected ctx: HttpContext) {}

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

    return { user }
  }
}
