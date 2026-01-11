import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('quiz_sessions', (table) => {
      table.string('full_name').nullable()
    })

    this.schema.alterTable('user_mcq_responses', (table) => {
      table.integer('session_id').unsigned().nullable().references('id').inTable('quiz_sessions').onDelete('SET NULL')
      table.index('session_id')
    })
  }

  async down() {
    this.schema.alterTable('user_mcq_responses', (table) => {
      table.dropColumn('session_id')
    })

    this.schema.alterTable('quiz_sessions', (table) => {
      table.dropColumn('full_name')
    })
  }
}