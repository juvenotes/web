import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class InstitutionSeeder extends BaseSeeder {
  async run() {
    // List of approved medical schools in Kenya
    const institutions = [
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
      // Additional institutions for diploma programs
      'Technical University of Mombasa',
      'Technical University of Kenya',
      'KMTC', // Kenya Medical Training College
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
      'Kabarak University',
      'United States International University-Africa',
    ]

    // Insert institutions with just their names
    await db.table('institutions').multiInsert(institutions.map((name) => ({ name })))
  }
}
