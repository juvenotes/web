import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('past_paper_id')
        .unsigned()
        .references('id')
        .inTable('past_papers')
        .onDelete('CASCADE')
        .nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('past_paper_id')
    })
  }
}
