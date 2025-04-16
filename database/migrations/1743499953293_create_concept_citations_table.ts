import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concept_citations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('concept_id')
        .unsigned()
        .references('id')
        .inTable('concepts')
        .onDelete('CASCADE')
      table.text('citation_text').notNullable()
      table.integer('citation_number').notNullable()

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
