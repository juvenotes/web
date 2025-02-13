import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'osce_parts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.text('part_text').notNullable()
      table.text('expected_answer').notNullable()
      table.integer('marks').notNullable()
      table.string('image_path').nullable() // Optional image for OSCE parts
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
