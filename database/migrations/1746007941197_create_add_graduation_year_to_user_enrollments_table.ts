import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_enrollments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('graduation_year').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('graduation_year')
    })
  }
}
