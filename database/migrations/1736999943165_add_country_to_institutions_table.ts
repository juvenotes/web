import { BaseSchema } from '@adonisjs/lucid/schema'
import { CountryCode } from '#enums/countries'

export default class extends BaseSchema {
  protected tableName = 'institutions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('country_code', Object.values(CountryCode)).defaultTo(CountryCode.KE).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('country_code')
    })
  }
}
