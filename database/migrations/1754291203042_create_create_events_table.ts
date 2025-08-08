import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.string('title', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.text('description').nullable()
      table.text('content').nullable()
      table.string('event_type', 50).notNullable() // webinar, workshop, conference, exam, etc.
      table.string('status', 50).defaultTo('draft') // draft, published, cancelled, completed
      table.dateTime('start_date').notNullable()
      table.dateTime('end_date').notNullable()
      table.dateTime('registration_deadline').nullable()
      table.string('venue').nullable()
      table.text('address').nullable()
      table.string('online_link').nullable()
      table.boolean('is_online').defaultTo(false)
      table.boolean('is_free').defaultTo(true)
      table.decimal('price', 10, 2).nullable()
      table.string('currency', 3).defaultTo('USD')
      table.integer('max_participants').nullable()
      table.integer('current_participants').defaultTo(0)
      table.string('image_url').nullable() // Added directly here
      table.dateTime('deleted_at').nullable()
      table.timestamps(true, true)

      // Add indexes for common queries
      table.index(['user_id'])
      table.index(['status'])
      table.index(['event_type'])
      table.index(['start_date'])
      table.index(['slug'])
      table.index(['deleted_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
