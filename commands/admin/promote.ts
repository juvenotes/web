import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import { Role } from '#enums/roles'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'

export default class Promote extends BaseCommand {
  static commandName = 'admin:promote'
  static description = 'Promote a user to admin role'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email of user to promote' })
  declare email: string

  async run() {
    if (env.get('NODE_ENV') === 'production' && !env.get('ALLOW_ADMIN_PROMOTION')) {
      this.logger.error('Admin promotion requires ALLOW_ADMIN_PROMOTION=true in production')
      return
    }

    const existingAdmin = await User.query().where('role_id', Role.ADMIN).first()
    if (existingAdmin) {
      this.logger.error('An admin user already exists')
      return
    }

    const user = await User.findBy('email', this.email)
    if (!user) {
      this.logger.error('User not found')
      return
    }

    // Get and validate password
    const password = await this.prompt.secure('Enter new admin password')
    const confirmPassword = await this.prompt.secure('Confirm password')

    if (password.length < 8) {
      this.logger.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      this.logger.error('Passwords do not match')
      return
    }

    // Update user
    user.password = await hash.make(password)
    user.roleId = Role.ADMIN
    await user.save()

    this.logger.success(`User ${this.email} promoted to admin with new password`)
  }
}
