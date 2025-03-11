import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_paper_stats'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('paper_id')
        .unsigned()
        .references('id')
        .inTable('past_papers')
        .onDelete('CASCADE')
      table.integer('questions_attempted').defaultTo(0)
      table.integer('questions_correct').defaultTo(0)
      table.integer('completion_percentage').defaultTo(0)
      table.jsonb('additional_data').defaultTo('{}')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Composite unique key
      table.unique(['user_id', 'paper_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
