import { ExamType, PaperType } from '#enums/exam_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'past_papers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.string('title').notNullable()
      table.string('slug').unique().notNullable()
      table.string('year').notNullable()
      table.enum('paper_type', Object.values(PaperType)).notNullable()
      table.enum('exam_type', Object.values(ExamType)).notNullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
