import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import type Question from '#models/question'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class QuestionPolicy extends BasePolicy {
  /**
   * Only logged in and editors/admins can create questions
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  view(user: User | null): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Only logged in and editors/admins can create questions
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  create(user: User): AuthorizerResponse {
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Only logged in and editors/admins can update questions
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  update(user: User, question: Question): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return question.userId === user.id && user.roleId === Role.EDITOR
  }

  /**
   * Only logged in and editors/admins can delete questions
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  delete(user: User, question: Question): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return question.userId === user.id && user.roleId === Role.EDITOR
  }
}
