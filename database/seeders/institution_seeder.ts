import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { InstitutionType } from '#enums/institution_type'
import { EducationLevel } from '#enums/education_level'
import db from '@adonisjs/lucid/services/db'

export default class EducationDataSeeder extends BaseSeeder {
  private courses = [
    { name: 'Bachelor of Medicine and Surgery (MBChB)' },
    { name: 'Bachelor of Dental Surgery (BDS)' },
    { name: 'Bachelor of Pharmacy (BPharm)' },
    { name: 'Bachelor of Science in Nursing (BScN)' },
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
  ]

  private techUniversities = ['Technical University of Mombasa', 'Technical University of Kenya']

  private kmtcBranches = [
    'Bomet',
    'Bondo',
    'Bungoma',
    'Busia',
    'Chuka',
    'Chwele',
    'Eldoret',
    'Embu',
    'Garissa',
    'Gatundu',
    'Homabay',
    'Imenti',
    'Isiolo',
    'Iten',
    'Kabarnet',
    'Kakamega',
    'Kangundo',
    'Kapenguria',
    'Kapkatet',
    'Kaptumo',
    'Karen',
    'Karuri',
    'Kilifi',
    'Kisii',
    'Kisumu',
    'Kitale',
    'Kitui',
    'Kombewa',
    'Kuria',
    'Kwale',
    'Lake Victoria',
    'Lamu',
    'Lodwar',
    'Loitoktok',
    'Lugari',
    'Machakos',
    'Makindu',
    'Makueni',
    'Mandera',
    'Manza',
    'Mathare',
    'Mbooni',
    'Meru',
    'Migori',
    'Molo',
    'Mombasa',
    'Mosoriot',
    'Msambweni',
    "Murang'a",
    'Mwingi',
    'Nairobi',
    'Nakuru',
    'Nyamira',
    'Nyandarua',
    'Nyahururu',
    'Nyamache',
    'Nyeri',
    'Othaya',
    'Port Reitz',
    'Rachuonyo',
    'Rera',
    'Siaya',
    'Sigowet',
    'Tana River',
    'Taveta',
    'Thika',
    'Ugenya',
    'Voi',
    'Vihiga',
    'Wajir',
    'Webuye',
  ]

  private polytechnics = [
    'The Eldoret National Polytechnic',
    'Kisii National Polytechnic',
    'Kisiwa Technical Training Institute',
    'The Kisumu National Polytechnic',
    'The Kabete National Polytechnic',
    'Nairobi Technical Training Institute',
    'The Nyeri National Polytechnic',
  ]

  async run() {
    const trx = await db.transaction()

    try {
      // 1. Seed education levels from enum
      console.log('Seeding education levels...')
      for (const level of Object.values(EducationLevel)) {
        console.log(`Creating education level: ${level}`)
        await trx.table('education_levels').insert({ name: level })
      }

      // 2. Seed institutions
      console.log('\nSeeding universities...')
      for (const name of this.universities) {
        console.log(`Creating university: ${name}`)
        await trx.table('institutions').insert({
          name,
          institution_type: InstitutionType.UNIVERSITY,
          is_active: true,
        })
      }

      console.log('\nSeeding technical universities...')
      for (const name of this.techUniversities) {
        console.log(`Creating technical university: ${name}`)
        await trx.table('institutions').insert({
          name,
          institution_type: InstitutionType.UNIVERSITY,
          is_active: true,
        })
      }

      // 3. Create KMTC and its branches
      console.log('\nSeeding KMTC main campus...')
      await trx.table('institutions').insert({
        name: 'Kenya Medical Training College',
        institution_type: InstitutionType.COLLEGE,
        is_active: true,
      })

      console.log('\nSeeding KMTC branches...')
      for (const branch of this.kmtcBranches) {
        console.log(`Creating KMTC branch: ${branch}`)
        await trx.table('institutions').insert({
          name: `KMTC - ${branch} Campus`,
          institution_type: InstitutionType.COLLEGE,
          branch,
          is_active: true,
        })
      }

      // 4. Create other medical college
      console.log('\nSeeding other medical colleges...')
      console.log("Creating St. Joseph's Nyabondo Medical Training College")
      await trx.table('institutions').insert({
        name: "St. Joseph's Nyabondo Medical Training College",
        institution_type: InstitutionType.COLLEGE,
        is_active: true,
      })

      // 5. Create polytechnics
      console.log('\nSeeding polytechnics...')
      for (const name of this.polytechnics) {
        console.log(`Creating polytechnic: ${name}`)
        await trx.table('institutions').insert({
          name,
          institution_type: InstitutionType.POLYTECHNIC,
          is_active: true,
        })
      }

      // 6. Create courses
      console.log('\nSeeding courses...')
      for (const course of this.courses) {
        console.log(`Creating course: ${course.name}`)
        await trx.table('courses').insert(course)
      }

      await trx.commit()
      console.log('\nSeeding completed successfully!')
    } catch (error) {
      await trx.rollback()
      console.error('Error seeding data:', error)
      throw error
    }
  }
}
