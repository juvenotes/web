import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_spot_responses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Foreign keys
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table
        .integer('station_id')
        .unsigned()
        .references('id')
        .inTable('spot_stations')
        .onDelete('CASCADE')

      // Response data
      table.string('action').notNullable()
      table.string('status').notNullable()
      table.text('original_station_text').nullable()

      // Timestamps
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
