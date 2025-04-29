import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('institution_course_id')
        .unsigned()
        .references('id')
        .inTable('institution_courses')

      // Ensure each user-institution-course combination is unique
      table.unique(['user_id', 'institution_course_id'])

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
