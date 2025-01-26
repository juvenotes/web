import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import PastPaper from '#models/past_paper'

export default class PastPaperPolicy extends BasePolicy {
  /**
   * Only logged-in editors/admins can view management interface
   */
  view(user: User | null): AuthorizerResponse {
    return !!user && (user.roleId === Role.EDITOR || user.roleId === Role.ADMIN)
  }

  /**
   * Only editors/admins can create papers
   */
  create(user: User): AuthorizerResponse {
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Editors can update ANY paper, admins can update any
   */
  update(user: User, _paper: PastPaper): AuthorizerResponse {
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }

  /**
   * Editors can delete ANY paper, admins can delete any
   */
  delete(user: User, _paper: PastPaper): AuthorizerResponse {
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }
}
