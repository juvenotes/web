import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MedicalArticle from '#models/medical_article'
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default class extends BaseSeeder {
  async run() {
    const csvPath = 'database/seeders/medical_articles.csv'
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    })

    // Parse JSON fields if needed
    const articles = records.map((row: any) => ({
      original_filename: row.original_filename,
      article_id: row.article_id,
      article_name: row.article_name,
      library_id: row.library_id,
      keywords: row.keywords,
      full_data_content: JSON.parse(row.full_data_content),
    }))

    await MedicalArticle.createMany(articles)
    console.log(`Seeded ${articles.length} medical articles`)
  }
}
