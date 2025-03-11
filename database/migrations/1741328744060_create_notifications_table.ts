import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.dropTableIfExists(this.tableName)

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('initiator_user_id').unsigned().references('id').inTable('users').nullable()
      table.integer('notification_type').notNullable()
      table.string('related_table').nullable()
      table.integer('related_id').nullable()
      table.string('title').notNullable()
      table.text('body').nullable()
      table.string('href').nullable()
      table.timestamp('read_at').nullable()
      table.timestamp('actioned_at').nullable()
      table.timestamps(true, true)

      // Index for faster retrieval
      table.index(['user_id', 'read_at'])
      table.index(['related_table', 'related_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
