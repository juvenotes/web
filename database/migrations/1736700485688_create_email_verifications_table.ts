import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'email_verifications'

  async up() {
    this.schema.alterTable('users', (table) => {
      table.boolean('is_email_verified').defaultTo(false)
      table.timestamp('email_verified_at').nullable()
    })

    // Create verifications table
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('token').unique()
      table.timestamp('expires_at')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.alterTable('users', (table) => {
      table.dropColumn('is_email_verified')
      table.dropColumn('email_verified_at')
    })
  }
}
