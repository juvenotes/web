import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserDto from '#dtos/user'
import { updateRoleValidator } from '#validators/user'

export default class ManageUsersController {
  async index({ inertia, bouncer }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')

    const users = await User.query().preload('role').orderBy('created_at', 'desc')

    return inertia.render('manage/users/index', {
      users: UserDto.fromArray(users),
    })
  }

  async updateRole({ request, response, params, bouncer }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await bouncer.with('UserPolicy').authorize('update', user)
    const { roleId } = await request.validateUsing(updateRoleValidator)
    await user.merge({ roleId }).save()
    return response.redirect().back()
  }
}
