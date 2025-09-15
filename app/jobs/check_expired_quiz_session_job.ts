import { fileURLToPath } from 'node:url'
import app from '@adonisjs/core/services/app'
import { BaseJob } from '@cavai/adonis-queue'
import { QuizSessionService } from '#services/quiz_session_service'

export default class CheckExpiredQuizSessionJob extends BaseJob {
  /**
   * Nr of times job is re-tried before it is marked as failed
   */
  static retries = 3

  /**
   * Delay for retries in seconds, so other jobs get chance to run
   */
  static retryAfter = 30

  /**
   * Filesystem path to job class
   */
  static classPath = app.relativePath(fileURLToPath(new URL(import.meta.url)))

  /**
   * Jobs accept additional payload that can be typed for easier usage
   */
  constructor(public payload: Record<string, any> = {}) {
    super()
  }

  /**
   * Job handler function to check and auto-submit expired quiz sessions
   */
  async handle() {
    try {
      const quizSessionService = new QuizSessionService()
      const expiredCount = await quizSessionService.checkExpiredSessions()
      
      if (expiredCount > 0) {
        console.log(`Auto-submitted ${expiredCount} expired quiz session(s)`)
      }
    } catch (error) {
      console.error('Failed to check expired quiz sessions:', error)
      throw error // Re-throw to trigger retry
    }
  }
}