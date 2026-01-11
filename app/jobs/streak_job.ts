import { BaseJob } from '#types/job'
import StreakService from '#services/streak_service'
import locks from '@adonisjs/lock/services/main'
import logger from '@adonisjs/core/services/logger'

export default class StreakJob extends BaseJob {
  async run() {
    const [executed] = await locks
      .createLock('job:streak', '5 minutes')
      .run(async () => {
        await StreakService.killExpiredStreaks()
      })

    if (!executed) {
      logger.debug('[StreakJob] Skipped - another instance is running')
    }
  }
}
