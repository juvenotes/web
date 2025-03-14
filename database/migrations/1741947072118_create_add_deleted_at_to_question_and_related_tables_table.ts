import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('questions', (table) => {
      table.timestamp('deleted_at').nullable()
    })

    this.schema.alterTable('mcq_choices', (table) => {
      table.timestamp('deleted_at').nullable()
    })

    this.schema.alterTable('saq_parts', (table) => {
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('saq_parts', (table) => {
      table.dropColumn('deleted_at')
    })

    this.schema.alterTable('mcq_choices', (table) => {
      table.dropColumn('deleted_at')
    })

    this.schema.alterTable('questions', (table) => {
      table.dropColumn('deleted_at')
    })
  }
}
