import { BaseCommand } from '@adonisjs/core/ace'
import { DateTime } from 'luxon'
import ArchiveOutdatedTodayJob from '#jobs/archive_outdated_today_job'

export default class ScheduleTodayArchiving extends BaseCommand {
  static commandName = 'schedule:today-archiving'
  static description = 'Schedule the archiving of outdated Today items'

  static settings = {
    loadApp: true,
  }

  async run() {
    // Schedule the job to run at 12:01 AM tomorrow
    const tomorrowMidnight = DateTime.now().plus({ days: 1 }).startOf('day').plus({ minutes: 1 }) // 12:01 AM to avoid any timezone issues

    this.logger.info(`Scheduling ArchiveOutdatedTodayJob for ${tomorrowMidnight.toISO()}`)

    await ArchiveOutdatedTodayJob.dispatch().delay(tomorrowMidnight)

    this.logger.success('Job scheduled successfully')
  }
}
