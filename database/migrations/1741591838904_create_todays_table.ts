import { BaseSchema } from '@adonisjs/lucid/schema'
import { TodayStatus } from '#enums/today_status'
import { StudyLevel } from '#enums/study_level'

export default class extends BaseSchema {
  protected tableName = 'todays'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.string('title').notNullable()
      table.string('slug').unique().notNullable()
      table.enum('study_level', Object.values(StudyLevel)).nullable()
      table.string('scheduled_for').notNullable()
      table
        .enum('status', Object.values(TodayStatus))
        .defaultTo(TodayStatus.SCHEDULED)
        .notNullable()

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
