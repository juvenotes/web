import { JobConfig } from '#types/job'
import { CronJob } from 'cron'
import logger from '@adonisjs/core/services/logger'

export default class SchedulerService {
  private jobs: JobConfig[] = []

  addJob(config: JobConfig) {
    this.jobs.push(config)
  }

  scheduleAllJobs() {
    for (const { key, cronExpression, job } of this.jobs) {
      new CronJob(
        cronExpression,
        () => {
          logger.info(`[Scheduler] Running job: ${key}`)
          try {
            job.run()
          } catch (error) {
            logger.error(`[Scheduler] Error running job: ${key}`, error)
          }
        },
        null,
        true
      )
      logger.info(`[Scheduler] Scheduled job: ${key} (${cronExpression})`)
    }
  }
}
