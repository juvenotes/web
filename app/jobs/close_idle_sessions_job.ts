import { BaseJob } from '#types/job'
import UserStudySession from '#models/user_study_session'
import StudyTimeService from '#services/study_time_service'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export default class CloseIdleSessionsJob extends BaseJob {
  async run() {
    const now = DateTime.now()
    // Find all sessions idle for more than 10 minutes
    const idleSessions = await UserStudySession.query()
      .where('isActive', true)
      .where('lastActivityAt', '<', now.minus({ minutes: 10 }).toSQL())

    logger.info(`[CloseIdleSessionsJob] Found ${idleSessions.length} idle sessions to close`)

    for (const session of idleSessions) {
      // Calculate the session duration up to lastActivityAt (not now)
      const additionalSeconds = Math.floor(
        Math.abs(session.startedAt.diff(session.lastActivityAt, 'seconds').seconds)
      )
      // Set session as inactive and set durationSeconds to the time up to lastActivityAt
      session.isActive = false
      session.durationSeconds = additionalSeconds
      await session.save()
      // Invalidate study time cache for the user
      await StudyTimeService.invalidateTotalStudyTimeCacheStatic(session.userId)
    }
  }
}
