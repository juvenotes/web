import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AdonisJobs extends BaseSchema {
  protected tableName = 'adonis_jobs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned()
      table.string('class_path').notNullable()
      table.text('payload').nullable()

      table.timestamp('created_at').defaultTo(this.db.knexRawQuery('NOW()'))
      table.timestamp('available_at').defaultTo(this.db.knexRawQuery('NOW()'))

      table.integer('attempts').defaultTo(0)
      table.boolean('failed').defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}