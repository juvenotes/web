import { BaseJob } from '#types/job'
import { QuizSessionService } from '#services/quiz_session_service'
import locks from '@adonisjs/lock/services/main'
import logger from '@adonisjs/core/services/logger'

// Singleton instance to avoid recreating per job run
const quizSessionService = new QuizSessionService()

export default class CheckExpiredQuizSessionJob extends BaseJob {
  /**
   * Job handler function to check and auto-submit expired quiz sessions
   * Uses locking to prevent overlapping executions
   */
  async run() {
    const [executed] = await locks
      .createLock('job:check-expired-quiz-sessions', '5 minutes')
      .run(async () => {
        const expiredCount = await quizSessionService.checkExpiredSessions()

        if (expiredCount > 0) {
          logger.info(`Auto-submitted ${expiredCount} expired quiz session(s)`)
        }
      })

    if (!executed) {
      logger.debug('[CheckExpiredQuizSessionJob] Skipped - another instance is running')
    }
  }
}
