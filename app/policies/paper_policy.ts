import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import PastPaper from '#models/past_paper'

export default class PastPaperPolicy extends BasePolicy {
  /**
   * Only logged in and editors/admins can create papers
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  view(user: User | null): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Only logged in and editors/admins can create papers
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  create(user: User): AuthorizerResponse {
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Only logged in and editors/admins can update papers
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  update(user: User, paper: PastPaper): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return paper.userId === user.id && user.roleId === Role.EDITOR
  }

  /**
   * Only logged in and editors/admins can delete papers
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  delete(user: User, paper: PastPaper): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return paper.userId === user.id && user.roleId === Role.EDITOR
  }
}
