import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'past_papers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('study_level').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('study_level')
    })
  }
}
