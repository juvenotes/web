import { BaseSchema } from '@adonisjs/lucid/schema'
import { InstitutionType } from '#enums/institution_type'

export default class extends BaseSchema {
  protected tableName = 'institutions'

  async up() {
    this.schema.createTable('institutions', (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.enum('institution_type', Object.values(InstitutionType)).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
