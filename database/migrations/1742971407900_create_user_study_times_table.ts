import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_study_times'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.date('date').notNullable()
      table.timestamp('last_activity_at')
      table.integer('concept_views').defaultTo(0)
      table.integer('mcq_attempts').defaultTo(0)
      table.integer('saq_views').defaultTo(0)
      table.integer('osce_views').defaultTo(0)
      table.integer('spot_views').defaultTo(0)
      table.integer('paper_views').defaultTo(0)
      table.integer('total_seconds').defaultTo(0)
      table.unique(['user_id', 'date'])
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
