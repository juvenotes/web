import { DateTime } from 'luxon'
import QuizSession from '#models/quiz_session'
import EventQuiz from '#models/event_quiz'
import UserQuizStat from '#models/user_quiz_stat'
import User from '#models/user'

export class QuizSessionService {
  /**
   * Start a new quiz session for a user
   */
  async startSession(
    userId: number,
    quizId: number,
    studentId?: string,
    school?: string,
    fullName?: string
  ) {
    // First check if there's an existing session
    const existingSession = await QuizSession.query()
      .where('userId', userId)
      .where('quizId', quizId)
      .where('status', 'active')
      .first()

    if (existingSession) {
      return existingSession
    }

    // Load quiz to get duration
    const quiz = await EventQuiz.findOrFail(quizId)

    const startedAt = DateTime.now()
    const expiresAt = quiz.durationMinutes
      ? startedAt.plus({ minutes: quiz.durationMinutes })
      : null

    // Create new session
    const session = await QuizSession.create({
      userId,
      quizId,
      startedAt,
      expiresAt,
      status: 'active',
      tabSwitches: 0,
      focusLosses: 0,
      autoSubmitted: false,
      activityLog: { started: startedAt.toISO() },
      studentId: studentId || null,
      school: school || null,
      fullName: fullName || (await this.getUserFullName(userId)) || null,
    })

    // Create or update user quiz stats with student info
    await UserQuizStat.updateOrCreate(
      { userId, quizId },
      {
        userId,
        quizId,
        studentId: studentId || null,
        school: school || null,
        questionsAttempted: 0,
        questionsCorrect: 0,
        completionPercentage: 0,
        score: 0,
        additionalData: {},
      }
    )

    return session
  }

  /**
   * Helper to fetch user full name
   */
  private async getUserFullName(userId: number): Promise<string | null> {
    const user = await User.find(userId)
    return user ? user.fullName : null
  }



  /**
   * Record suspicious activity (tab switch, focus loss, etc.)
   */
  async recordActivity(userId: number, quizId: number, activityType: string, data?: any) {
    const session = await this.getActiveSession(userId, quizId)
    if (!session) return null

    const currentLog = session.activityLog || {}
    const activities = currentLog.activities || []

    // Add new activity
    activities.push({
      type: activityType,
      timestamp: DateTime.now().toISO(),
      data,
    })

    // Update counters
    if (activityType === 'tab_switch') {
      session.tabSwitches++
    } else if (activityType === 'focus_loss') {
      session.focusLosses++
    }

    // Update activity log
    session.activityLog = {
      ...currentLog,
      activities,
    }

    await session.save()
    return session
  }

  /**
   * Check if session should be auto-submitted due to suspicious activity
   */
  async checkAutoSubmit(userId: number, quizId: number): Promise<boolean> {
    const session = await this.getActiveSession(userId, quizId)
    if (!session) return false

    const quiz = await EventQuiz.findOrFail(quizId)
    if (!quiz.lockdownMode || !quiz.autoSubmit) return false

    // Auto-submit if more than 5 tab switches or focus losses
    const suspiciousActivities = session.tabSwitches + session.focusLosses
    if (suspiciousActivities >= 5) {
      await this.submitSession(userId, quizId, true)
      return true
    }

    return false
  }

  /**
   * Submit a quiz session (manually or auto)
   */
  async submitSession(userId: number, quizId: number, autoSubmitted = false) {
    const session = await this.getActiveSession(userId, quizId)
    if (!session) return null

    session.status = 'submitted'
    session.endedAt = DateTime.now()
    session.autoSubmitted = autoSubmitted

    // Update activity log
    const currentLog = session.activityLog || {}
    session.activityLog = {
      ...currentLog,
      submitted: DateTime.now().toISO(),
      autoSubmitted,
    }

    await session.save()
    return session
  }

  /**
   * Check and auto-submit expired quiz sessions
   * Uses batch update for performance (avoids N+1 queries)
   */
  async checkExpiredSessions(): Promise<number> {
    const now = DateTime.now()

    // Batch update all expired sessions in a single query
    // Batch update returns array (PostgreSQL) or number (MySQL/SQLite) depending on driver/config
    const result = (await QuizSession.query()
      .where('status', 'active')
      .whereNotNull('expiresAt')
      .where('expiresAt', '<', now.toSQL())
      .update({
        status: 'submitted',
        endedAt: now.toSQL(),
        autoSubmitted: true,
      })) as number | number[]

    // Handle both return types safely
    if (Array.isArray(result)) {
      return result.length
    }
    return result
  }

  /**
   * Get active session for a user and quiz
   */
  async getActiveSession(userId: number, quizId: number) {
    return await QuizSession.query()
      .where('userId', userId)
      .where('quizId', quizId)
      .where('status', 'active')
      .first()
  }

  /**
   * Get session with time remaining
   */
  async getSessionTimeRemaining(userId: number, quizId: number): Promise<number | null> {
    const session = await this.getActiveSession(userId, quizId)
    if (!session || !session.expiresAt) return null

    const now = DateTime.now()
    const timeRemaining = session.expiresAt.diff(now, 'seconds').seconds

    return Math.max(0, timeRemaining)
  }
}
