import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { EducationLevel } from '#enums/education_level'
import db from '@adonisjs/lucid/services/db'

export default class EducationLevelSeeder extends BaseSeeder {
  async run() {
    // Insert education levels from the enum
    await db.table('education_levels').multiInsert(
      Object.values(EducationLevel).map((level) => ({
        name: level,
      }))
    )
  }
}
