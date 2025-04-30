import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'institution_courses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('institution_id').unsigned().references('id').inTable('institutions')
      table.integer('course_id').unsigned().references('id').inTable('courses')

      // Ensure each institution-course combination is unique
      table.unique(['institution_id', 'course_id'])

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
