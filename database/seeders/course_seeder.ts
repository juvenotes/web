import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class CourseSeeder extends BaseSeeder {
  async run() {
    console.log('\n=== Seeding Courses ===')

    const courses = [
      { name: 'Bachelor of Medicine and Surgery (MBChB)' },
      { name: 'Bachelor of Dental Surgery (BDS)' },
      { name: 'Bachelor of Pharmacy (BPharm)' },
      { name: 'Bachelor of Science in Nursing (BScN)' },
      { name: 'Diploma in Pharmacy' },
    ]

    // Get education level IDs
    const diplomaLevel = await db.from('education_levels').where('name', 'DIPLOMA').first()
    const undergraduateLevel = await db
      .from('education_levels')
      .where('name', 'UNDERGRADUATE')
      .first()

    if (!diplomaLevel || !undergraduateLevel) {
      throw new Error(
        'Required education levels not found. Please run education level seeder first.'
      )
    }

    console.log('\nEducation Levels found:')
    console.log(`  - Diploma Level (ID: ${diplomaLevel.id})`)
    console.log(`  - Undergraduate Level (ID: ${undergraduateLevel.id})`)

    // Associate courses with their education levels
    const coursesWithLevels = courses.map((course) => {
      // Diploma in Pharmacy goes to Diploma level, all others are undergraduate
      const educationLevelId = course.name.startsWith('Diploma')
        ? diplomaLevel.id
        : undergraduateLevel.id

      return {
        ...course,
        education_level_id: educationLevelId,
      }
    })

    // Insert courses with their education level associations
    await db.table('courses').multiInsert(coursesWithLevels)

    console.log('\nCreated courses:')
    coursesWithLevels.forEach((course) => {
      const level = course.education_level_id === diplomaLevel.id ? 'Diploma' : 'Undergraduate'
      console.log(`  - ${course.name} (${level})`)
    })
  }
}
