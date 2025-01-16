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

    // Get and validate password
    const password = await this.prompt.secure('Enter admin password')
    const confirmPassword = await this.prompt.secure('Confirm password')

    if (password.length < 8) {
      this.logger.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      this.logger.error('Passwords do not match')
      return
    }

    if (this.create) {
      // Create new admin
      await User.create({
        email: this.email,
        password: await hash.make(password),
        roleId: Role.ADMIN,
      })
      this.logger.success(`Created new admin user ${this.email}`)
    } else {
      // Promote existing user
      const user = await User.findBy('email', this.email)
      if (!user) {
        this.logger.error('User not found')
        return
      }
      user.password = await hash.make(password)
      user.roleId = Role.ADMIN
      await user.save()
      this.logger.success(`User ${this.email} promoted to admin`)
    }
  }
}
