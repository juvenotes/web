import { BaseJob } from '#types/job'
import { QuizSessionService } from '#services/quiz_session_service'

export default class CheckExpiredQuizSessionJob extends BaseJob {
  /**
   * Job handler function to check and auto-submit expired quiz sessions
   */
  async run() {
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