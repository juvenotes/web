import { BaseJob } from '#types/job'
import StreakService from '#services/streak_service'
import locks from '@adonisjs/lock/services/main'
import logger from '@adonisjs/core/services/logger'

export default class StreakJob extends BaseJob {
  async run() {
    const [executed] = await locks.createLock('job:streak', '10 minutes').run(async () => {
      try {
        await StreakService.killExpiredStreaks()
      } catch (error) {
        logger.error({
          job: 'StreakJob',
          error,
          message: 'Failed to kill expired streaks',
        })
        throw error
      }
    })

    if (!executed) {
      logger.debug('[StreakJob] Skipped - another instance is running')
    }
  }
}
