import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MediaAsset from '#models/media_asset'
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default class MediaAssetSeeder extends BaseSeeder {
  public async run() {
    const csvPath = 'database/seeders/media_assests.csv'
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    })

    for (const row of records) {
      await MediaAsset.create({
        hintId: row.hint_id,
        hrefValue: row.href_value,
        originalMediaUrl: row.original_media_url || null,
        mediaName: row.media_name,
        mediaType: row.media_type as 'IMAGE' | 'VIDEO' | 'HTML' | 'AUDIO' | 'OTHER',
        mimeType: row.mime_type,
        cloudinaryUrl: row.cloudinary_url || null,
      })
    }
    console.log(`Seeded ${records.length} media assets`)
  }
}
