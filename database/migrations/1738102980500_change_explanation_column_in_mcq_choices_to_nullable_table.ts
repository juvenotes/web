import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mcq_choices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('explanation').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('explanation').notNullable().alter()
    })
  }
}
