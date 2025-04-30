import { BaseSeeder } from '@adonisjs/lucid/seeders'
import EducationLevelSeeder from './education_level_seeder.js'
import InstitutionSeeder from './institution_seeder.js'
import CourseSeeder from './course_seeder.js'
import InstitutionCourseSeeder from './institution_course_seeder.js'

export default class MainSeeder extends BaseSeeder {
  async run() {
    // Run education level seeder first (no dependencies)
    await new EducationLevelSeeder(this.client).run()

    // Run institution seeder (no dependencies)
    await new InstitutionSeeder(this.client).run()

    // Run course seeder (depends on education levels)
    await new CourseSeeder(this.client).run()

    // Create institution-course relationships
    await new InstitutionCourseSeeder(this.client).run()

    console.log('All seeding completed successfully!')
  }
}
