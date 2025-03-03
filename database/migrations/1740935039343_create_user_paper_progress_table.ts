import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_paper_progresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('paper_id').unsigned().references('id').inTable('past_papers').notNullable()
      table.integer('last_question_id').unsigned().references('id').inTable('questions').nullable()
      table.timestamp('last_visited_at').notNullable()
      table.integer('attempt_count').defaultTo(1)
      table.unique(['user_id', 'paper_id'])
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
