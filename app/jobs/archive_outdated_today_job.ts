import { fileURLToPath } from 'node:url'
import app from '@adonisjs/core/services/app'
import { BaseJob } from '@cavai/adonis-queue'
import Today from '#models/today'
import { TodayStatus } from '#enums/today_status'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export default class ArchiveOutdatedTodayJob extends BaseJob {
  /**
   * Number of retry attempts if the job fails
   */
  static retries = 3

  /**
   * Delay between retries in seconds
   */
  static retryAfter = 60

  /**
   * Path to the job class
   */
  static classPath = app.relativePath(fileURLToPath(new URL('./', import.meta.url)))

  /**
   * Optional payload for the job
   */
  constructor(public payload: { forceRun?: boolean } = {}) {
    super()
  }

  /**
   * Archive outdated Today items
   */
  async handle() {
    const today = DateTime.now().toISODate()

    logger.info('Running ArchiveOutdatedTodayJob', {
      currentDate: today,
      forceRun: this.payload.forceRun || false,
    })

    try {
      // Find active Today items with scheduled dates not matching today
      const outdatedItems = await Today.query()
        .where('status', TodayStatus.ACTIVE)
        .whereNot('scheduled_for', today)

      if (outdatedItems.length === 0) {
        logger.info('No outdated Today items to archive')
        return
      }

      // Archive the outdated items
      for (const item of outdatedItems) {
        item.status = TodayStatus.ARCHIVED
        await item.save()

        logger.info(`Archived outdated Today item: ${item.title} (ID: ${item.id})`)
      }

      logger.info(`Successfully archived ${outdatedItems.length} outdated Today items`)
    } catch (error) {
      logger.error('Failed to archive outdated Today items', { error })
      throw error // This will trigger a retry based on the retry settings
    }
  }
}
