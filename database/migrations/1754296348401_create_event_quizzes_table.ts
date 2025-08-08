import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_quizzes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('event_id').references('id').inTable('events').onDelete('cascade').notNullable()
      table.string('title').notNullable()
      table.string('slug').unique().notNullable()
      table.text('description').nullable()
      table.timestamps(true, true)

      // Add indexes for common queries
      table.index(['event_id'])
      table.index(['slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
