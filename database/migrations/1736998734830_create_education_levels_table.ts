import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'education_levels'

  async up() {
    this.schema.createTable('education_levels', (table) => {
      table.increments('id')
      table.string('name').notNullable() // Diploma, Undergraduate, Postgraduate
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
