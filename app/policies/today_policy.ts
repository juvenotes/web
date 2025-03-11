import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type User from '#models/user'
import type Today from '#models/today'
import { Role } from '#enums/roles'

export default class TodayPolicy extends BasePolicy {
  view(user: User | null): AuthorizerResponse {
    return !!user && (user.roleId === Role.EDITOR || user.roleId === Role.ADMIN)
  }

  create(user: User): AuthorizerResponse {
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  update(user: User, _today: Today): AuthorizerResponse {
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }

  delete(user: User, _today: Today): AuthorizerResponse {
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }
}
