import { DifficultyLevel, QuestionType } from '#enums/question_types'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('questions', (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.string('slug', 255).notNullable().unique()
      table.enum('type', Object.values(QuestionType)).notNullable()
      table.text('question_text').notNullable()
      table.enum('difficulty_level', Object.values(DifficultyLevel)).nullable()
      table.timestamps(true, true)
    })

    this.schema.createTable('mcq_choices', (table) => {
      table.increments('id')
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.text('choice_text').notNullable()
      table.boolean('is_correct').notNullable()
      table.text('explanation').notNullable()
      table.timestamps(true, true)
    })

    // Question parts for SAQs
    this.schema.createTable('saq_parts', (table) => {
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
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable('saq_parts')
    this.schema.dropTable('mcq_choices')
    this.schema.dropTable('questions')
  }
}
