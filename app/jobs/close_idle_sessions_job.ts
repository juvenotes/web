import { BaseJob } from '#types/job'
import UserStudySession from '#models/user_study_session'
import StudyTimeService from '#services/study_time_service'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import locks from '@adonisjs/lock/services/main'

export default class CloseIdleSessionsJob extends BaseJob {
  async run() {
    const [executed] = await locks
      .createLock('job:close-idle-sessions', '15 minutes') // Increased for large workloads
      .run(async () => {
        try {
          const now = DateTime.now()
          // Find all sessions idle for more than 10 minutes
          const idleSessions = await UserStudySession.query()
            .where('isActive', true)
            .where('lastActivityAt', '<', now.minus({ minutes: 10 }).toSQL())

          logger.info(`[CloseIdleSessionsJob] Found ${idleSessions.length} idle sessions to close`)

          for (const session of idleSessions) {
            try {
              // Calculate the session duration up to lastActivityAt (not now)
              const diffInSeconds = session.lastActivityAt.diff(session.startedAt, 'seconds').seconds

              if (diffInSeconds < 0) {
                logger.warn({
                  job: 'CloseIdleSessionsJob',
                  message: 'Negative session duration detected',
                  sessionId: session.id,
                  startedAt: session.startedAt,
                  lastActivityAt: session.lastActivityAt
                })
                // Skip this session or handle gracefully? 
                // If data is corrupt, closing it might be safer to stop using it, but let's just log and skip calculation
                // Or force 0? The request says "skip handling ... or set additionalSeconds to 0".
                // Let's set additionalSeconds to 0 to safeguard.
              }

              const additionalSeconds = Math.max(0, Math.floor(diffInSeconds))

              // Set session as inactive and set durationSeconds to the time up to lastActivityAt
              session.isActive = false
              session.durationSeconds = additionalSeconds
              await session.save()
              // Invalidate study time cache for the user
              await StudyTimeService.invalidateTotalStudyTimeCacheStatic(session.userId)
            } catch (err) {
              logger.error({
                job: 'CloseIdleSessionsJob',
                error: err,
                message: `Failed to process idle session ${session.id}`,
                userId: session.userId
              })
              // Continue to next session
            }
          }
        } catch (error) {
          logger.error({
            job: 'CloseIdleSessionsJob',
            error,
            message: 'Failed to close idle sessions',
          })
        }
      })

    if (!executed) {
      logger.debug('[CloseIdleSessionsJob] Skipped - another instance is running')
    }
  }
}

