import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_mcq_responses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('source', 20).defaultTo('paper')
      table.index('source')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('source')
    })
  }
}
