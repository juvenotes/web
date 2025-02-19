import { BaseSchema } from '@adonisjs/lucid/schema'
import { TrainingLevel } from '#enums/training_level'

export default class extends BaseSchema {
  protected tableName = 'concepts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('training_level', Object.values(TrainingLevel)).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('training_level')
    })
  }
}
