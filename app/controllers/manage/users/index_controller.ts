import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserDto from '#dtos/user'
import { updateRoleValidator } from '#validators/user'

export default class ManageUsersController {
  async index({ inertia, bouncer, logger, auth, request }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')
    const context = {
      controller: 'ManageUsersController',
      action: 'index',
    }

    const page = request.input('page', 1)
    const limit = 30

    const users = await User.query()
      .preload('role')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    logger.info({
      ...context,
      userCount: users.total,
      currentPage: users.currentPage,
      totalPages: users.lastPage,
      message: 'Retrieved users list',
      userId: auth.user?.id,
    })

    return inertia.render('manage/users/index', {
      users: UserDto.fromArray(users.all()),
      totalUsers: users.total,
      meta: {
        current_page: users.currentPage,
        last_page: users.lastPage,
        first_page: users.firstPage,
        per_page: users.perPage,
      },
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
