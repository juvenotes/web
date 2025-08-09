import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_quizzes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status', 50).defaultTo('draft') // draft, published
      table.index(['status'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
    })
  }
}
