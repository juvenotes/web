import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('question_topics', (table) => {
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.integer('topic_id').unsigned().references('id').inTable('concepts').onDelete('CASCADE')
      table.primary(['question_id', 'topic_id'])
      table.timestamps(true, true)
    })

    this.schema.createTable('question_units', (table) => {
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.integer('unit_id').unsigned().references('id').inTable('concepts').onDelete('CASCADE')
      table.primary(['question_id', 'unit_id'])
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable('question_topics')
    this.schema.dropTable('question_units')
  }
}
