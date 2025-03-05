import { BaseSchema } from '@adonisjs/lucid/schema'
import { ResponseStatus } from '#enums/response_status'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('user_mcq_responses', (table) => {
      table.string('status', 20).notNullable().defaultTo(ResponseStatus.ACTIVE)
      table.string('original_choice_text').nullable() // For historical accuracy
    })

    this.schema.alterTable('user_saq_responses', (table) => {
      table.string('status', 20).notNullable().defaultTo(ResponseStatus.ACTIVE)
      table.string('original_part_text').nullable() // For historical accuracy
    })
  }

  async down() {
    this.schema.alterTable('user_mcq_responses', (table) => {
      table.dropColumn('status')
      table.dropColumn('original_choice_text')
    })

    this.schema.alterTable('user_saq_responses', (table) => {
      table.dropColumn('status')
      table.dropColumn('original_part_text')
    })
  }
}
