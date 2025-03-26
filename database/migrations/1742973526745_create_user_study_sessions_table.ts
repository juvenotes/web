import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_study_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enum('resource_type', ['concept', 'paper', 'osce', 'spot', 'today']).notNullable()
      table.integer('resource_id').notNullable()
      table.timestamp('started_at').notNullable()
      table.timestamp('last_activity_at').notNullable()
      table.boolean('is_active').defaultTo(true)
      table.integer('duration_seconds').defaultTo(0)
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
