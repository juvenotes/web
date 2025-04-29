import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class InstitutionCourseSeeder extends BaseSeeder {
  async run() {
    // Fetch all institutions
    const institutions = await db.from('institutions').select('id', 'name')

    // Fetch all courses
    const courses = await db.from('courses').select('id', 'name', 'education_level_id')

    // Define mappings for which institutions offer which courses
    const institutionCoursePairs = []

    // Approved medical schools (MBChB)
    const medicalSchools = [
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
    ]

    // Approved dental schools (BDS)
    const dentalSchools = ['University of Nairobi', 'Moi University']

    // Approved pharmacy degree institutions
    const pharmacyDegreeSchools = [
      'University of Nairobi',
      'Kenyatta University',
      'Jomo Kenyatta University of Agriculture & Technology',
      'Maseno University',
      'Kisii University',
      'United States International University-Africa',
      'Kenya Methodist University',
      'Mount Kenya University',
      'Kabarak University',
    ]

    // Approved pharmacy diploma institutions
    const pharmacyDiplomaSchools = [
      'KMTC',
      'The Eldoret National Polytechnic',
      'Kisii National Polytechnic',
      'Kisiwa Technical Training Institute',
      'The Kisumu National Polytechnic',
      'The Kabete National Polytechnic',
      'Nairobi Technical Training Institute',
      "St. Joseph's Nyabondo Medical Training College",
      'The Nyeri National Polytechnic',
      'Rift Valley Technical Training Institute',
      'Thika Technical Training Institute',
      'Technical University of Mombasa',
      'Technical University of Kenya',
      'Mount Kenya University',
      'Kenya Methodist University',
    ]

    // Create institution-course relationships ONLY for verified combinations
    for (const institution of institutions) {
      for (const course of courses) {
        // Skip any combinations where we don't have certainty
        if (!institution || !institution.name || !course || !course.name) {
          continue
        }

        // Match MBChB to approved medical schools
        if (
          course.name === 'Bachelor of Medicine and Surgery (MBChB)' &&
          medicalSchools.includes(institution.name)
        ) {
          institutionCoursePairs.push({
            institution_id: institution.id,
            course_id: course.id,
          })
        }

        // Match BDS to approved dental schools
        else if (
          course.name === 'Bachelor of Dental Surgery (BDS)' &&
          dentalSchools.includes(institution.name)
        ) {
          institutionCoursePairs.push({
            institution_id: institution.id,
            course_id: course.id,
          })
        }

        // Match BPharm to approved pharmacy degree institutions
        else if (
          course.name === 'Bachelor of Pharmacy (BPharm)' &&
          pharmacyDegreeSchools.includes(institution.name)
        ) {
          institutionCoursePairs.push({
            institution_id: institution.id,
            course_id: course.id,
          })
        }

        // Match Diploma in Pharmacy to approved diploma institutions
        else if (
          course.name === 'Diploma in Pharmacy' &&
          pharmacyDiplomaSchools.includes(institution.name)
        ) {
          institutionCoursePairs.push({
            institution_id: institution.id,
            course_id: course.id,
          })
        }

        // Match Nursing to medical schools (only if explicitly listed)
        else if (
          course.name === 'Bachelor of Science in Nursing (BScN)' &&
          medicalSchools.includes(institution.name)
        ) {
          institutionCoursePairs.push({
            institution_id: institution.id,
            course_id: course.id,
          })
        }
      }
    }

    // Insert only verified institution-course relationships
    if (institutionCoursePairs.length > 0) {
      await db.table('institution_courses').multiInsert(institutionCoursePairs)
      console.log(
        `Created ${institutionCoursePairs.length} verified institution-course relationships`
      )
    } else {
      console.log('No verified institution-course relationships to create')
    }
  }
}
