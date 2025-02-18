import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'osce_parts'

  async up() {
    this.schema.renameTable(this.tableName, 'stations')
  }

  async down() {
    this.schema.renameTable('stations', this.tableName)
  }
}
