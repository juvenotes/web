import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concept_question'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('concept_id')
        .unsigned()
        .references('id')
        .inTable('concepts')
        .onDelete('CASCADE')
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.primary(['concept_id', 'question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
