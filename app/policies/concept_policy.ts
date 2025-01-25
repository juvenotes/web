import { BasePolicy } from '@adonisjs/bouncer'
import type User from '#models/user'
import type Concept from '#models/concept'
import { Role } from '#enums/roles'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ConceptPolicy extends BasePolicy {
  view(user: User | null): AuthorizerResponse {
    // Only logged-in editors/admins can view (for management)
    return !!user && (user.roleId === Role.EDITOR || user.roleId === Role.ADMIN)
  }

  create(user: User): AuthorizerResponse {
    // Editors and admins can create
    return user.roleId === Role.EDITOR || user.roleId === Role.ADMIN
  }

  update(user: User, _concept: Concept): AuthorizerResponse {
    // Editors can update ANY concept, admins can update any
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }

  delete(user: User, _concept: Concept): AuthorizerResponse {
    // Editors can delete ANY concept, admins can delete any
    return user.roleId === Role.ADMIN || user.roleId === Role.EDITOR
  }
}
