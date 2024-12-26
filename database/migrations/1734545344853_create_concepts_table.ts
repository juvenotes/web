import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'concepts'

  async up() {
    this.schema.createTable('concepts', (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('parent_id').references('id').inTable('concepts').nullable()
      table.string('title', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.text('knowledge_block').nullable()
      table.boolean('is_terminal').defaultTo(false)
      table.integer('level').notNullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamps(true, true)
    })

    this.schema.createTable('related_concepts', (table) => {
      table.integer('concept_id').references('id').inTable('concepts').notNullable()
      table.integer('related_concept_id').references('id').inTable('concepts').notNullable()
      table.primary(['concept_id', 'related_concept_id'])
      table.check('concept_id <> related_concept_id')
    })
  }

  async down() {
    this.schema.dropTable('related_concepts')
    this.schema.dropTable('concepts')
  }
}
