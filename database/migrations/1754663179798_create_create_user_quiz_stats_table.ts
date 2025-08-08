import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_quiz_stats'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('quiz_id').unsigned().references('event_quizzes.id').onDelete('CASCADE')
      table.integer('questions_attempted').defaultTo(0)
      table.integer('questions_correct').defaultTo(0)
      table.decimal('completion_percentage', 5, 2).defaultTo(0)
      table.integer('score').defaultTo(0)
      table.json('additional_data').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Ensure unique user-quiz combination
      table.unique(['user_id', 'quiz_id'])

      // Index for leaderboard queries
      table.index(['quiz_id', 'score'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
