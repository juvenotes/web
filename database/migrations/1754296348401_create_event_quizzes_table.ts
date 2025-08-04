import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_quizzes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('event_id').references('id').inTable('events').onDelete('cascade').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.jsonb('mcqs').defaultTo('[]') // Array of MCQ objects
      table.timestamps(true, true)

      // Add indexes for common queries
      table.index(['event_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
