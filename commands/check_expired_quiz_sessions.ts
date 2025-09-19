import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { QuizSessionService } from '#services/quiz_session_service'

export default class CheckExpiredQuizSessions extends BaseCommand {
  static commandName = 'check:expired-quiz-sessions'
  static description = 'Check for expired quiz sessions and auto-submit them'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Checking for expired quiz sessions...')
    
    try {
      const quizSessionService = new QuizSessionService()
      const expiredCount = await quizSessionService.checkExpiredSessions()
      
      this.logger.info(`Auto-submitted ${expiredCount} expired quiz session(s)`)
    } catch (error) {
      this.logger.error(`Failed to check expired quiz sessions: ${(error as Error).message}`)
      this.exitCode = 1
    }
  }
}