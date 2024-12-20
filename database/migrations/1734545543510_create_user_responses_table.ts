import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('user_mcq_responses', (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('question_id').references('id').inTable('questions').notNullable()
      table.string('selected_option', 1).notNullable() // A, B, C, D, E
      table.boolean('is_correct').notNullable()
      table.timestamp('created_at')
    })

    this.schema.createTable('user_saq_responses', (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('question_id').references('id').inTable('questions').notNullable()
      table.integer('part_id').references('id').inTable('question_parts').notNullable()
      table.text('answer_text').notNullable()
      table.decimal('score', 5, 2).nullable()
      table.boolean('is_marked').defaultTo(false)
      table.text('feedback').nullable()
      table.timestamp('created_at')
      table.timestamp('marked_at').nullable()
    })

    this.schema.createTable('user_progress', (table) => {
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('concept_id').references('id').inTable('concepts').notNullable()
      table.jsonb('progress_data').defaultTo('{}')
      table.primary(['user_id', 'concept_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable('user_progress')
    this.schema.dropTable('user_saq_responses')
    this.schema.dropTable('user_mcq_responses')
  }
}
