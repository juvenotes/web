import SchedulerService from '#services/scheduler_service'
import StreakJob from '#jobs/streak_job'
import CloseIdleSessionsJob from '#jobs/close_idle_sessions_job'

const scheduler = new SchedulerService()

scheduler.addJob({
  key: 'streak-job',
  cronExpression: '0 2 * * *', // every day at 2am
  job: new StreakJob(),
})

scheduler.addJob({
  key: 'close-idle-sessions',
  cronExpression: '*/5 * * * *', // every 5 minutes
  job: new CloseIdleSessionsJob(),
})

scheduler.scheduleAllJobs()
