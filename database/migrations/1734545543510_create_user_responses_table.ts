import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('user_mcq_responses', (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('question_id').references('id').inTable('questions').notNullable()
      table.string('selected_option', 1).notNullable() // A, B, C, D, E
      table.boolean('is_correct').notNullable()
      table.timestamps(true, true)
    })

    this.schema.createTable('user_saq_responses', (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('question_id').references('id').inTable('questions').notNullable()
      table.integer('part_id').references('id').inTable('saq_parts').notNullable() // Fixed table name
      table.text('answer_text').notNullable()
      table.decimal('score', 5, 2).nullable()
      table.boolean('is_marked').defaultTo(false)
      table.text('feedback').nullable()
      table.timestamps(true, true)
      table.timestamp('marked_at').nullable()
    })

    // This will have to be defined later, what kind of information we want from here
    this.schema.createTable('user_concept_progress', (table) => {
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('concept_id').references('id').inTable('concepts').notNullable()
      table.jsonb('progress_data').defaultTo('{}')
      table.primary(['user_id', 'concept_id'])
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable('user_progress')
    this.schema.dropTable('user_saq_responses')
    this.schema.dropTable('user_mcq_responses')
  }
}
