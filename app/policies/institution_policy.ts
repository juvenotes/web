import User from '#models/user'
// import Institution from '#models/institution'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { Role } from '#enums/roles'
import Institution from '#models/institution'

export default class InstitutionPolicy extends BasePolicy {
  view(user: User | null): AuthorizerResponse {
    return !!user && user.roleId === Role.ADMIN
  }

  create(user: User): AuthorizerResponse {
    return user.roleId === Role.ADMIN
  }

  update(user: User, _institution: Institution): AuthorizerResponse {
    return user.roleId === Role.ADMIN
  }

  delete(user: User, _institution: Institution): AuthorizerResponse {
    return user.roleId === Role.ADMIN
  }
}
