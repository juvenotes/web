import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import ArchiveOutdatedTodayJob from '#jobs/archive_outdated_today_job'
import AppBoot from '#events/app_boot'
import logger from '@adonisjs/core/services/logger'

/**
 * Listener that handles scheduling the archiving of outdated Today items
 */
@inject()
export default class ScheduleTodayArchiving {
  /**
   * Handles the AppBoot event
   */
  async handle(_event: AppBoot) {
    try {
      // Run the job immediately to archive any outdated items
      await ArchiveOutdatedTodayJob.dispatch()

      // Schedule for tomorrow at 12:01 AM
      const tomorrowMidnight = DateTime.now().plus({ days: 1 }).startOf('day').plus({ minutes: 1 })

      await ArchiveOutdatedTodayJob.dispatch().delay(tomorrowMidnight)

      logger.info(`Scheduled ArchiveOutdatedTodayJob for ${tomorrowMidnight.toISO()}`)
    } catch (error) {
      logger.error('Failed to schedule today archiving', { error })
    }
  }
}
