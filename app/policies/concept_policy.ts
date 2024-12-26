import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import type Concept from '#models/concept'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ConceptPolicy extends BasePolicy {
  /**
   * Only logged in and editors/admins can create concepts
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  view(user: User | null): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Only logged in and editors/admins can create concepts
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  create(user: User, concept: Concept): AuthorizerResponse {
    return concept.userId === user.id && user.roleId === Role.EDITOR
  }

  /**
   * Only logged in and editors/admins can update concepts
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  update(user: User, concept: Concept): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return concept.userId === user.id && user.roleId === Role.EDITOR
  }

  /**
   * Only logged in and editors/admins can delete concepts
   * Used in the management controllers, not the basics controllers
   * Where we are using abilities to control behavior
   */
  delete(user: User, concept: Concept): AuthorizerResponse {
    if (user.roleId === Role.ADMIN) return true
    return concept.userId === user.id && user.roleId === Role.EDITOR
  }
}
