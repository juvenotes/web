import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  /**
   * Only admins can view all users
   */
  view(user: User | null): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.ADMIN
  }

  /**
   * Only admins can create users
   */
  create(user: User): AuthorizerResponse {
    return user.roleId === Role.ADMIN
  }

  /**
   * Users can update their own profile, admins can update any profile
   */
  update(user: User, target: User): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return user.id === target.id
  }

  /**
   * Only admins can delete users
   */
  delete(user: User, _target: User): AuthorizerResponse {
    return user.roleId === Role.ADMIN
  }
}
