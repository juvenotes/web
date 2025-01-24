import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'past_papers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('metadata').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('metadata')
    })
  }
}
