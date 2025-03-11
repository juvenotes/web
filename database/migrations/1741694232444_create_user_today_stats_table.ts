import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_today_stats'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.date('date').notNullable()
      table.integer('today_id').unsigned().references('id').inTable('todays').nullable()
      table.integer('questions_attempted').defaultTo(0)
      table.integer('questions_correct').defaultTo(0)
      table.jsonb('additional_data').defaultTo('{}')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Composite unique key
      table.unique(['user_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
