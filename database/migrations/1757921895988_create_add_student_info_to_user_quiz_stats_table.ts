import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_quiz_stats'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('student_id').nullable()
      table.string('school').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('student_id')
      table.dropColumn('school')
    })
  }
}