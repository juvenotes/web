import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concept_sections'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('concept_id')
        .unsigned()
        .references('id')
        .inTable('concepts')
        .onDelete('CASCADE')
      table
        .integer('parent_section_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('concept_sections')
        .onDelete('CASCADE')
      table.string('title').notNullable()
      table.integer('position').notNullable()
      table.text('content').nullable()
      table.string('slug').unique().notNullable()

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
