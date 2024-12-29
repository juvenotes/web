import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('avatar_url').nullable()
      table.string('provider').nullable()
      table.string('provider_id').nullable()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('avatar_url')
      table.dropColumn('provider')
      table.dropColumn('provider_id')
    })
  }
}
