import { BaseSchema } from '@adonisjs/lucid/schema'
import { ResponseStatus } from '#enums/response_status'

export default class extends BaseSchema {
  protected tableName = 'user_osce_responses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status').defaultTo(ResponseStatus.ACTIVE).notNullable()
      table.text('original_station_text').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
      table.dropColumn('original_station_text')
    })
  }
}
