import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs/promises'
import MediaAsset from '#models/media_asset'
import db from '@adonisjs/lucid/services/db'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default class UpdateMediaUrls extends BaseCommand {
  public static commandName = 'media:update_urls'
  public static description = 'Updates media assets with URLs from a JSON payload file'

  public static options: CommandOptions = {
    startApp: true, // This is crucial! It boots the Adonis app, giving us access to models.
  }

  public async run() {
    this.logger.info('Starting media asset URL update process...')

    const appRoot = fileURLToPath(this.app.appRoot)
    const payloadPath = path.join(appRoot, 'missing_table_rows.json')

    // Database is now imported at the top of the file

    try {
      const fileContent = await fs.readFile(payloadPath, 'utf-8')
      const payload: {
        hint_id: string
        original_media_url: string
        cloudinary_url: string
      }[] = JSON.parse(fileContent)

      this.logger.info(`Found ${payload.length} records to update in payload file.`)

      let updatedCount = 0
      let notFoundCount = 0
      // Pro-tip: Use a transaction to ensure all updates succeed or none do.
      await db.transaction(async (trx) => {
        for (const item of payload) {
          const asset = await MediaAsset.findBy('hint_id', item.hint_id)

          if (asset) {
            // Use the transaction client for the database operation
            asset.useTransaction(trx)

            asset.originalMediaUrl = item.original_media_url
            asset.cloudinaryUrl = item.cloudinary_url

            await asset.save()
            updatedCount++
            this.logger.success(`Updated: ${item.hint_id}`)
          } else {
            notFoundCount++
            this.logger.warning(`Not Found in DB: ${item.hint_id}`)
          }
        }
      })

      this.logger.info('---------------------------------')
      this.logger.success('Update process finished successfully!')
      this.logger.info(`Total records updated: ${updatedCount}`)
      if (notFoundCount > 0) {
        this.logger.warning(`Records in payload but not found in DB: ${notFoundCount}`)
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === 'ENOENT'
      ) {
        this.logger.error(`Payload file not found at: ${payloadPath}`)
      } else {
        this.logger.error('An error occurred during the update process:')
        this.logger.error(error instanceof Error ? error.message : String(error))
      }
    }
  }
}
