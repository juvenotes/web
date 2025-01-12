import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { Role } from '#enums/roles'

export default class AdminDashboardPolicy extends BasePolicy {
  /**
   * Only logged in users can access dashboard
   */
  view(user: User | null): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }

  /**
   * Only admins can access admin dashboard
   */
  manage(user: User | null): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }
}
