import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('user_mcq_responses', (table) => {
      table.integer('choice_id').references('id').inTable('mcq_choices').nullable()
    })
  }

  async down() {
    this.schema.alterTable('user_mcq_responses', (table) => {
      table.dropColumn('choice_id')
    })
  }
}
