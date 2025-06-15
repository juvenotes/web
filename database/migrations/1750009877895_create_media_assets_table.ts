import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'media_assets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('hint_id').notNullable()
      table.string('href_value').notNullable()
      table.string('original_media_url').nullable()
      table.string('media_name').notNullable()
      table.enu('media_type', ['IMAGE', 'VIDEO', 'HTML', 'AUDIO', 'OTHER']).notNullable()
      table.string('mime_type').notNullable()
      table.string('cloudinary_url').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
