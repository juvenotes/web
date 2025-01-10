import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_education_entries'

  async up() {
    // User Education History
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

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
