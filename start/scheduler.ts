import SchedulerService from '#services/scheduler_service'
import StreakJob from '#jobs/streak_job'

const scheduler = new SchedulerService()

scheduler.addJob({
  key: 'streak-job',
  cronExpression: '0 2 * * *', // every day at 2am
  job: new StreakJob(),
})

scheduler.scheduleAllJobs()
