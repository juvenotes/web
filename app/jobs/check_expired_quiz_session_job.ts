import { BaseJob } from '#types/job'
import { QuizSessionService } from '#services/quiz_session_service'
import locks from '@adonisjs/lock/services/main'
import logger from '@adonisjs/core/services/logger'

export default class CheckExpiredQuizSessionJob extends BaseJob {
  /**
   * Job handler function to check and auto-submit expired quiz sessions
   * Uses locking to prevent overlapping executions
   */
  async run() {
    const [executed] = await locks
      .createLock('job:check-expired-quiz-sessions', '15 minutes') // Increased timeout for potentially large workloads
      .run(async () => {
        try {
          const quizSessionService = new QuizSessionService()
          const expiredCount = await quizSessionService.checkExpiredSessions()

          if (expiredCount > 0) {
            logger.info(`Auto-submitted ${expiredCount} expired quiz session(s)`)
          }
        } catch (error) {
          logger.error({
            job: 'CheckExpiredQuizSessionJob',
            error,
            message: 'Failed to check expired sessions',
          })
          // Don't rethrow - let the job complete so lock is released
        }
      })

    if (!executed) {
      logger.debug('[CheckExpiredQuizSessionJob] Skipped - another instance is running')
    }
  }
}

