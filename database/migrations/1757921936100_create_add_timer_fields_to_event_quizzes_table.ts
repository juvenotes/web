import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_quizzes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('duration_minutes').nullable().comment('Quiz duration in minutes')
      table.boolean('has_timer').defaultTo(false)
      table.boolean('auto_submit').defaultTo(false)
      table.boolean('lockdown_mode').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('duration_minutes')
      table.dropColumn('has_timer')
      table.dropColumn('auto_submit')
      table.dropColumn('lockdown_mode')
    })
  }
}