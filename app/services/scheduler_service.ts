import { JobConfig } from '#types/job'
import { CronJob } from 'cron'
import logger from '@adonisjs/core/services/logger'

export default class SchedulerService {
  private jobs: JobConfig[] = []
  private cronJobs: CronJob[] = []

  addJob(config: JobConfig) {
    this.jobs.push(config)
  }

  scheduleAllJobs() {
    for (const { key, cronExpression, job } of this.jobs) {
      const cronJob = new CronJob(
        cronExpression,
        async () => {
          logger.info(`[Scheduler] Running job: ${key}`)
          try {
            await job.run()
          } catch (error) {
            logger.error(`[Scheduler] Error running job: ${key}`, error)
          }
        },
        null,
        true
      )
      this.cronJobs.push(cronJob)
      logger.info(`[Scheduler] Scheduled job: ${key} (${cronExpression})`)
    }
  }

  stopAllJobs() {
    for (const cronJob of this.cronJobs) {
      cronJob.stop()
    }
    logger.info('[Scheduler] All scheduled jobs have been stopped.')
  }
}
