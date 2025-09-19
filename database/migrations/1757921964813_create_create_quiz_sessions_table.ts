import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quiz_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('quiz_id').unsigned().references('event_quizzes.id').onDelete('CASCADE')
      table.dateTime('started_at').nullable()
      table.dateTime('ended_at').nullable()
      table.dateTime('expires_at').nullable()
      table.integer('tab_switches').defaultTo(0)
      table.integer('focus_losses').defaultTo(0)
      table.json('activity_log').nullable()
      table.boolean('auto_submitted').defaultTo(false)
      table.string('status').defaultTo('active') // active, completed, abandoned, submitted
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Ensure unique user-quiz session
      table.unique(['user_id', 'quiz_id'])
      
      // Index for performance
      table.index(['quiz_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}