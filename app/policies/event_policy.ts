import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import Event from '#models/event'

export default class EventPolicy extends BasePolicy {
  /**
   * Only logged-in editors/admins can view management interface
   */
  view(user: User | null): AuthorizerResponse {
    return !!user && (user.roleId === Role.EDITOR || user.roleId === Role.ADMIN)
  }

  /**
   * Only editors/admins can create events
   */
  create(user: User): AuthorizerResponse {
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Editors can update ANY event, admins can update any
   */
  update(user: User, _event: Event): AuthorizerResponse {
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }

  /**
   * Editors can delete ANY event, admins can delete any
   */
  delete(user: User, _event: Event): AuthorizerResponse {
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }

  /**
   * Check if user can manage events (used for UI display)
   */
  manage(user: User | null): AuthorizerResponse {
    return !!user && (user.roleId === Role.EDITOR || user.roleId === Role.ADMIN)
  }
}