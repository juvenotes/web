import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_concept_views'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('concept_id')
        .unsigned()
        .references('id')
        .inTable('concepts')
        .onDelete('CASCADE')
      table.timestamp('viewed_at')
      table.integer('view_count').defaultTo(1)
      table.string('status', 20).defaultTo('active')
      table.unique(['user_id', 'concept_id'])
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
