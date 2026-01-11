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
          const BATCH_SIZE = 100

          while (true) {
            // Find batch of sessions idle for more than 10 minutes
            // Since we modify 'isActive', the offset stays 0 effectively
            const idleSessions = await UserStudySession.query() // @ts-ignore
              .where('isActive', true)
              .where('lastActivityAt', '<', now.minus({ minutes: 10 }).toSQL())
              .limit(BATCH_SIZE)

            if (idleSessions.length === 0) {
              break
            }

            logger.info(`[CloseIdleSessionsJob] Processing batch of ${idleSessions.length} idle sessions`)

            const updates: Promise<any>[] = []
            const cacheInvalidations: Promise<void>[] = []

            for (const session of idleSessions) {
              try {
                // Calculate the session duration up to lastActivityAt (not now)
                const diffInSeconds = session.lastActivityAt.diff(session.startedAt, 'seconds').as('seconds')
                const totalDurationSeconds = Math.max(0, Math.floor(diffInSeconds))

                // Set session as inactive and set durationSeconds
                session.isActive = false
                session.durationSeconds = totalDurationSeconds

                // Queue save and validation
                updates.push(session.save())
                cacheInvalidations.push(StudyTimeService.invalidateTotalStudyTimeCacheStatic(session.userId))
              } catch (err) {
                logger.error({
                  job: 'CloseIdleSessionsJob',
                  error: err,
                  message: `Failed to prepare idle session ${session.id}`,
                  userId: session.userId
                })
              }
            }

            // Execute batch updates
            if (updates.length > 0) {
              await Promise.all(updates)
              await Promise.all(cacheInvalidations)
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

