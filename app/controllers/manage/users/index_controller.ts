import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserDto from '#dtos/user'
import { updateRoleValidator } from '#validators/user'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class ManageUsersController {
  async index({ inertia, bouncer, logger, auth, request }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')

    const context = {
      controller: 'ManageUsersController',
      action: 'index',
      userId: auth.user?.id,
    }

    const page = request.input('page', 1)
    const limit = 20
    const search = request.input('search', '')

    // Build query with proper typing
    const query = User.query().preload('role').orderBy('created_at', 'desc')

    // Apply search filter if provided
    if (search) {
      query.where((builder: ModelQueryBuilderContract<typeof User>) => {
        builder.whereILike('full_name', `%${search}%`).orWhereILike('email', `%${search}%`)
      })
    }

    // Execute the query with pagination
    const users = await query.paginate(page, limit)

    // Get total count for all users (regardless of search/pagination)
    const totalCount = await User.query().count('* as total').first()
    const totalUsers = Number(totalCount?.$extras.total || 0)

    logger.info({
      ...context,
      userCount: users.total,
      currentPage: users.currentPage,
      totalPages: users.lastPage,
      searchQuery: search || null,
      message: 'Retrieved users list',
    })

    return inertia.render('manage/users/index', {
      users: UserDto.fromArray(users.all()),
      totalUsers,
      meta: {
        current_page: users.currentPage,
        last_page: users.lastPage,
        first_page: users.firstPage,
        per_page: users.perPage,
      },
      filters: {
        search,
      },
    })
  }

  async updateRole({ request, response, params, bouncer, logger, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with('UserPolicy').authorize('update', user)

    const { roleId } = await request.validateUsing(updateRoleValidator)
    await user.merge({ roleId }).save()

    logger.info({
      controller: 'ManageUsersController',
      action: 'updateRole',
      targetUserId: user.id,
      newRoleId: roleId,
      message: 'User role updated',
      userId: auth.user?.id,
    })

    return response.redirect().back()
  }
}
