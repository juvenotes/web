import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'past_papers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('concept_id')
        .unsigned()
        .references('id')
        .inTable('concepts')
        .onDelete('CASCADE')
        .notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('concept_id')
    })
  }
}
