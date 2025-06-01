import { BaseJob } from '#types/job'
import StreakService from '#services/streak_service'

export default class StreakJob extends BaseJob {
  async run() {
    await StreakService.killExpiredStreaks()
  }
}
