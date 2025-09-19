import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_quizzes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('quiz_mode', ['standard', 'timed_lockdown']).defaultTo('standard').comment('Quiz mode: standard (immediate feedback) or timed_lockdown (timed with authentication)')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quiz_mode')
    })
  }
}