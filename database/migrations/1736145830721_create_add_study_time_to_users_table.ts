import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('total_study_time').defaultTo(0)
      table.integer('streak_count').defaultTo(0)
      table.timestamp('last_login').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('total_study_time')
      table.dropColumn('streak_count')
      table.dropColumn('last_login')
    })
  }
}
