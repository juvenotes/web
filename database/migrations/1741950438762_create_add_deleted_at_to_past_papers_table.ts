import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('past_papers', (table) => {
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('past_papers', (table) => {
      table.dropColumn('deleted_at')
    })
  }
}
