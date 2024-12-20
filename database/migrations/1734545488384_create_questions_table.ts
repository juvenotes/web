import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('questions', (table) => {
      table.increments('id')
      table.integer('concept_id').references('id').inTable('concepts').nullable()
      table.enum('type', ['mcq', 'saq']).notNullable()
      table.text('question_text').notNullable()
      table.jsonb('config').notNullable() // For MCQ options, answers, explanations
      table.integer('marks').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Question parts for SAQs
    this.schema.createTable('question_parts', (table) => {
      table.increments('id')
      table.integer('question_id').references('id').inTable('questions').notNullable()
      table.integer('part_number').notNullable()
      table.text('part_text').notNullable()
      table.text('model_answer').notNullable()
      table.integer('marks').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['question_id', 'part_number'])
    })
  }

  async down() {
    this.schema.dropTable('question_parts')
    this.schema.dropTable('questions')
  }
}
