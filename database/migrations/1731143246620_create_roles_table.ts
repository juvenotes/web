import { BaseSchema } from '@adonisjs/lucid/schema'
import { Role } from '#enums/roles'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary()
      table.string('name').notNullable().unique()
      table.text('description').nullable()
      table.timestamps(true, true)
    })

    const now = new Date().toISOString()

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: Role.USER,
          name: 'user',
          description: 'Default user role',
          created_at: now,
          updated_at: now,
        },
        {
          id: Role.EDITOR,
          name: 'editor',
          description: 'Can create and manage content',
          created_at: now,
          updated_at: now,
        },
        {
          id: Role.ADMIN,
          name: 'admin',
          description: 'Full system access',
          created_at: now,
          updated_at: now,
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
