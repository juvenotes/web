import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { InstitutionType } from '#enums/institution_type'
import db from '@adonisjs/lucid/services/db'

export default class EducationDataSeeder extends BaseSeeder {
  private educationLevels = ['Diploma', 'Undergraduate', 'Postgraduate']

  private courses = [
    { name: 'Bachelor of Medicine and Surgery (MBChB)' },
    { name: 'Bachelor of Dental Surgery (BDS)' },
    { name: 'Bachelor of Pharmacy (BPharm)' },
    { name: 'Diploma in Pharmacy' },
  ]

  private universities = [
    'University of Nairobi',
    'Moi University',
    'Kenyatta University',
    'Egerton University',
    'Kenya Methodist University',
    'Maseno University',
    'Jomo Kenyatta University of Agriculture and Technology',
    'Mount Kenya University',
    'Uzima University',
    'Masinde Muliro University of Science and Technology',
    'Kisii University',
    'The Aga Khan University',
    'Pwani University',
    'United States International University-Africa',
    'Kabarak University',
  ]

  private techUniversities = ['Technical University of Mombasa', 'Technical University of Kenya']

  private kmtcBranches = ['Nairobi', 'Nakuru', 'Kisumu', 'Nyeri', 'Manza', 'Mombasa']

  private polytechnics = [
    'The Eldoret National Polytechnic',
    'Kisii National Polytechnic',
    'Kisiwa Technical Training Institute',
    'The Kisumu National Polytechnic',
    'The Kabete National Polytechnic',
    'Nairobi Technical Training Institute',
    'The Nyeri National Polytechnic',
    'Rift Valley Technical Training Institute',
    'Thika Technical Training Institute',
  ]

  async run() {
    const trx = await db.transaction()

    try {
      // 1. Create education levels
      const educationLevels = await Promise.all(
        this.educationLevels.map(
          (name) =>
            trx
              .table('education_levels')
              .insert({ name })
              .returning('id')
              .then((rows) => rows[0].id) // Extract just the ID
        )
      )

      const [diploma, undergraduate] = educationLevels

      // 2. Create universities
      const universities = await Promise.all([
        ...this.universities.map((name) =>
          trx
            .table('institutions')
            .insert({
              name,
              institution_type: InstitutionType.UNIVERSITY,
              is_active: true,
            })
            .returning('id')
            .then((rows) => rows[0].id)
        ),
        ...this.techUniversities.map((name) =>
          trx
            .table('institutions')
            .insert({
              name,
              institution_type: InstitutionType.UNIVERSITY,
              is_active: true,
            })
            .returning('id')
            .then((rows) => rows[0].id)
        ),
      ])

      // 3. Create KMTC and its branches
      const kmtc = await trx
        .table('institutions')
        .insert({
          name: 'Kenya Medical Training College',
          institution_type: InstitutionType.COLLEGE,
          is_active: true,
        })
        .returning('id')
        .then((rows) => rows[0].id)

      await Promise.all(
        this.kmtcBranches.map((branch) =>
          trx.table('institutions').insert({
            name: `KMTC - ${branch} Campus`,
            institution_type: InstitutionType.COLLEGE,
            branch,
            is_active: true,
          })
        )
      )

      // 4. Create other medical college
      await trx.table('institutions').insert({
        name: "St. Joseph's Nyabondo Medical Training College",
        institution_type: InstitutionType.COLLEGE,
        is_active: true,
      })

      // 5. Create polytechnics
      await Promise.all(
        this.polytechnics.map((name) =>
          trx.table('institutions').insert({
            name,
            institution_type: InstitutionType.POLYTECHNIC,
            is_active: true,
          })
        )
      )

      // 6. Create courses
      const courses = await Promise.all(
        this.courses.map((course) =>
          trx
            .table('courses')
            .insert(course)
            .returning('id')
            .then((rows) => rows[0].id)
        )
      )

      // 7. Link courses to institutions with education levels
      const courseInstitutionMappings = [
        // MBChB - Only specific universities
        ...universities.slice(0, 13).map((uniId) => ({
          institution_id: uniId,
          course_id: courses[0], // MBChB
          education_level_id: undergraduate,
          is_active: true,
        })),

        // BDS - Only UoN and Moi
        ...universities.slice(0, 2).map((uniId) => ({
          institution_id: uniId,
          course_id: courses[1], // BDS
          education_level_id: undergraduate,
          is_active: true,
        })),

        // BPharm - Selected universities
        ...universities.slice(0, 9).map((uniId) => ({
          institution_id: uniId,
          course_id: courses[2], // BPharm
          education_level_id: undergraduate,
          is_active: true,
        })),

        // Diploma in Pharmacy - KMTC branches
        {
          institution_id: kmtc,
          course_id: courses[3], // Diploma in Pharmacy
          education_level_id: diploma,
          is_active: true,
        },
      ]

      await trx.table('institution_courses').multiInsert(courseInstitutionMappings)

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
