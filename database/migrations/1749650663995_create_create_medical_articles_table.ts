import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medical_articles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('pk_id').primary()
      table.text('original_filename').unique()
      table.text('article_id').notNullable().unique()
      table.text('article_name')
      table.text('library_id')
      table.text('keywords')
      table.jsonb('full_data_content').notNullable()
      table.timestamp('imported_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
