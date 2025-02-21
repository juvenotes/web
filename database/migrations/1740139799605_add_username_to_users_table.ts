import { BaseSchema } from '@adonisjs/lucid/schema'
import { generateUsername } from '#utils/generate_username'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // First add the column as nullable
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username').nullable()
    })

    // Wait for the schema changes to be applied
    await this.defer(async () => {
      // Generate usernames for existing users
      const users = await this.db.from('users').select('id')

      for (const user of users) {
        let username = generateUsername()
        let exists = true

        while (exists) {
          // Check existing usernames excluding null values
          const existing = await this.db
            .from('users')
            .whereNotNull('username')
            .where('username', username)
            .first()

          if (!existing) {
            exists = false
          } else {
            username = generateUsername()
          }
        }

        await this.db.from('users').where('id', user.id).update({ username })
      }

      // After populating usernames, make the column required
      this.schema.alterTable(this.tableName, (table) => {
        table.string('username').notNullable().unique().alter()
      })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('username')
    })
  }
}
