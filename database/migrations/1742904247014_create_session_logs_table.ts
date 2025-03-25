import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('token', 255).nullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()
      table.string('browser_name', 100).nullable()
      table.string('browser_engine', 100).nullable()
      table.string('browser_version', 100).nullable()
      table.string('device_model', 100).nullable()
      table.string('device_type', 100).nullable()
      table.string('device_vendor', 100).nullable()
      table.string('os_name', 100).nullable()
      table.string('os_version', 100).nullable()
      table.string('city', 100).nullable()
      table.string('country', 100).nullable()
      table.string('country_code', 20).nullable()
      table.float('latitude').nullable()
      table.float('longitude').nullable()
      table.datetime('last_touched_at').nullable()
      table.datetime('login_at').nullable()
      table.boolean('login_successful').defaultTo(false)
      table.datetime('logout_at').nullable()
      table.boolean('force_logout').defaultTo(false)
      table.boolean('is_remember_session').defaultTo(false)
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
