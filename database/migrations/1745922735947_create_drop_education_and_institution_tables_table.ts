import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'drop_education_and_institution_tables'

  async up() {
    // First drop user_education_entries as it references institution_courses and education_levels
    this.schema.dropTable('user_education_entries')

    // Then drop institution_courses as it references institutions, courses and education_levels
    this.schema.dropTable('institution_courses')

    // Now we can drop institutions and courses
    this.schema.dropTable('institutions')
    this.schema.dropTable('courses')

    // Finally drop education_levels
    this.schema.dropTable('education_levels')
  }

  async down() {
    // Re-create tables in reverse order
    this.schema.createTable('education_levels', (table) => {
      table.increments('id')
      table.string('name').notNullable() // Diploma, Undergraduate, Postgraduate
      table.timestamps(true, true)
    })

    this.schema.createTable('institutions', (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.enum('institution_type', ['UNIVERSITY', 'COLLEGE', 'POLYTECHNIC']).nullable()
      table.boolean('is_active').defaultTo(true)
      table.string('branch').nullable()
      table.enum('country_code', ['KE', 'UG', 'TZ', 'RW']).defaultTo('KE').nullable()
      table.timestamps(true, true)
    })

    this.schema.createTable('courses', (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.timestamps(true, true)
    })

    this.schema.createTable('institution_courses', (table) => {
      table.increments('id')
      table.integer('institution_id').unsigned().references('institutions.id')
      table.integer('course_id').unsigned().references('courses.id')
      table.integer('education_level_id').unsigned().references('education_levels.id')
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true, true)
      table.unique(['institution_id', 'course_id', 'education_level_id'])
    })

    this.schema.createTable('user_education_entries', (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('institution_course_id').unsigned().references('institution_courses.id')
      table.integer('education_level_id').unsigned().references('education_levels.id')
      table.integer('graduation_year').notNullable()
      table.timestamps(true, true)
      table.unique(['user_id', 'institution_course_id', 'education_level_id'])
    })
  }
}
