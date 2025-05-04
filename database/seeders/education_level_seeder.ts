import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { EducationLevel } from '#enums/education_level'
import db from '@adonisjs/lucid/services/db'

export default class EducationLevelSeeder extends BaseSeeder {
  async run() {
    console.log('\n=== Seeding Education Levels ===')

    // Insert education levels from the enum
    const levels = Object.values(EducationLevel).map((level) => ({
      name: level,
    }))

    await db.table('education_levels').multiInsert(levels)

    console.log(`✓ Created ${levels.length} education levels:`)
    levels.forEach((level) => console.log(`  - ${level.name}`))
  }
}
