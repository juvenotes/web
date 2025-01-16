import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import { Role } from '#enums/roles'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'

// # Create new admin
// node ace admin:promote --create admin@example.com

// # Promote existing user
// node ace admin:promote existing@user.com

export default class Promote extends BaseCommand {
  static commandName = 'admin:promote'
  static description = 'Create or promote a user to admin role'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email of user' })
  declare email: string

  @flags.boolean({ description: 'Create new admin user' })
  declare create: boolean

  async run() {
    if (env.get('NODE_ENV') === 'production' && !env.get('ALLOW_ADMIN_PROMOTION')) {
      this.logger.error(
        'Admin creation/promotion requires ALLOW_ADMIN_PROMOTION=true in production'
      )
      return
    }

    const existingAdmin = await User.query().where('role_id', Role.ADMIN).first()
    if (existingAdmin) {
      this.logger.error('An admin user already exists')
      return
    }

    if (this.create) {
      // Create new admin with default password
      await User.create({
        email: this.email,
        password: await hash.make('changeme123'),
        roleId: Role.ADMIN,
      })
      this.logger.success(`Created new admin user ${this.email}`)
      this.logger.info('Default password is: changeme123')
    } else {
      // Promote existing user
      const user = await User.findBy('email', this.email)
      if (!user) {
        this.logger.error('User not found')
        return
      }
      user.roleId = Role.ADMIN
      await user.save()
      this.logger.success(`User ${this.email} promoted to admin`)
    }
  }
}
