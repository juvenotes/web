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
   * Only editors and admins can create concepts
   */
  create(user: User): AuthorizerResponse {
    if (!user) return false
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  /**
   * Editors can only update their own concepts
   * Admins can update any concept
   */
  update(user: User, concept: Concept): AuthorizerResponse {
    if (!user) return false
    if (user.roleId === Role.ADMIN) return true
    return concept.userId === user.id && user.roleId === Role.EDITOR
  }

  /**
   * Editors can only delete their own concepts
   * Admins can delete any concept
   */
  delete(user: User, concept: Concept): AuthorizerResponse {
    if (!user) return false
    if (user.roleId === Role.ADMIN) return true
    return concept.userId === user.id && user.roleId === Role.EDITOR
  }
}
