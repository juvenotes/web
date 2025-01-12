import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'institution_courses'

  async up() {
    // Institution Courses - Which courses are offered where
    this.schema.createTable('institution_courses', (table) => {
      table.increments('id')
      table.integer('institution_id').unsigned().references('institutions.id')
      table.integer('course_id').unsigned().references('courses.id')
      table.integer('education_level_id').unsigned().references('education_levels.id')
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true, true)

      // Each course-level combo can only be offered once per institution
      table.unique(['institution_id', 'course_id', 'education_level_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
