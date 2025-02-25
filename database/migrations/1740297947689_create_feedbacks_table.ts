import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'question_feedbacks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.text('feedback_text').notNullable()
      table.text('feedback_target').notNullable()
      table.text('feedback_source').notNullable()
      table.boolean('is_resolved').defaultTo(false)
      table.timestamp('resolved_at', { useTz: true }).nullable()
      table.integer('resolved_by').unsigned().references('id').inTable('users').nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
