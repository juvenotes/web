import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected eventQuizzesTable = 'event_quizzes'
  protected userQuizStatsTable = 'user_quiz_stats'

  async up() {
    this.schema.alterTable(this.eventQuizzesTable, (table) => {
      table.boolean('time_limit').defaultTo(false)
      table.timestamp('start_time').nullable()
      table.timestamp('end_time').nullable()
    })

    this.schema.alterTable(this.userQuizStatsTable, (table) => {
      table.string('full_name')
    })
  }

  async down() {
    this.schema.alterTable(this.eventQuizzesTable, (table) => {
      table.dropColumn('time_limit')
      table.dropColumn('start_time')
      table.dropColumn('end_time')
    })

    this.schema.alterTable(this.userQuizStatsTable, (table) => {
      table.dropColumn('full_name')
    })
  }
}
