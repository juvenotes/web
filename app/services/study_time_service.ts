import { DateTime } from 'luxon'
import UserStudySession from '#models/user_study_session'
import db from '@adonisjs/lucid/services/db'
import UserStudyTime from '#models/user_study_time'
import redis from '@adonisjs/redis/services/main'

export default class StudyTimeService {
  /**
   * Maximum idle time in minutes before a session is auto-closed
   */
  private MAX_IDLE_TIME_MINUTES = 30

  /**
   * Record user activity and manage study sessions
   */
  async recordActivity(
    userId: number,
    resourceType: 'concept' | 'paper' | 'osce' | 'spot' | 'today',
    resourceId: number,
    contentType?: 'mcq' | 'saq' | 'osce' | 'spot' | null
  ) {
    const now = DateTime.now()

    return await db.transaction(async (trx) => {
      // 1. Find active session or create new one
      const activeSession = await UserStudySession.query({ client: trx })
        .where('userId', userId)
        .where('resourceType', resourceType)
        .where('resourceId', resourceId)
        .where('isActive', true)
        .orderBy('lastActivityAt', 'desc')
        .first()

      let session: UserStudySession

      if (activeSession) {
        // Calculate time since last activity
        const idleTimeMinutes = Math.abs(activeSession.lastActivityAt.diff(now, 'minutes').minutes)

        if (idleTimeMinutes <= this.MAX_IDLE_TIME_MINUTES) {
          // Continue existing session - calculate additional time
          const additionalSeconds = Math.floor(
            Math.abs(activeSession.lastActivityAt.diff(now, 'seconds').seconds)
          )

          // Update session
          session = await activeSession
            .useTransaction(trx)
            .merge({
              lastActivityAt: now,
              durationSeconds: activeSession.durationSeconds + additionalSeconds,
            })
            .save()
        } else {
          // Close the old session
          await activeSession.useTransaction(trx).merge({ isActive: false }).save()

          // Create new session
          session = await UserStudySession.create(
            {
              userId,
              resourceType,
              resourceId,
              startedAt: now,
              lastActivityAt: now,
              isActive: true,
              durationSeconds: 0,
            },
            { client: trx }
          )
        }
      } else {
        // Start a new session
        session = await UserStudySession.create(
          {
            userId,
            resourceType,
            resourceId,
            startedAt: now,
            lastActivityAt: now,
            isActive: true,
            durationSeconds: 0,
          },
          { client: trx }
        )
      }

      // 2. Update daily aggregation in user_study_times
      await this.updateDailyAggregation(userId, resourceType, now, trx, contentType)

      // Invalidate cache after recording activity
      await this.invalidateTotalStudyTimeCache(userId)

      return session
    })
  }

  /**
   * Update daily aggregation record
   */
  private async updateDailyAggregation(
    userId: number,
    resourceType: 'concept' | 'paper' | 'osce' | 'spot' | 'today',
    timestamp: DateTime,
    trx: any,
    contentType?: 'mcq' | 'saq' | 'osce' | 'spot' | null
  ) {
    const today = timestamp.toFormat('yyyy-MM-dd')

    // Map resource type to the appropriate counter field
    const counterField = this.getCounterFieldForResourceType(resourceType, contentType)

    const existingRecord = await trx
      .from('user_study_times')
      .where('user_id', userId)
      .where('date', today)
      .first()

    if (existingRecord) {
      // Update existing record - using knex increment instead of raw
      await trx
        .from('user_study_times')
        .where('user_id', userId)
        .where('date', today)
        .update({ last_activity_at: timestamp.toSQL() })
        .increment(counterField, 1)
    } else {
      // Create new record with initial values for all counters
      const initialValues: Record<string, any> = {
        user_id: userId,
        date: today,
        last_activity_at: timestamp.toSQL(),
        concept_views: 0,
        mcq_attempts: 0,
        saq_views: 0,
        osce_views: 0,
        spot_views: 0,
        paper_views: 0,
        total_seconds: 0,
      }

      // Increment the specific counter
      initialValues[counterField] = 1

      // Insert record
      await trx.insertQuery().table('user_study_times').insert(initialValues)
    }
  }

  /**
   * Maps resource type to counter field in the daily aggregation table
   */
  private getCounterFieldForResourceType(
    resourceType: 'concept' | 'paper' | 'osce' | 'spot' | 'today' | string,
    contentType?: 'mcq' | 'saq' | 'osce' | 'spot' | null
  ): 'concept_views' | 'mcq_attempts' | 'saq_views' | 'osce_views' | 'spot_views' | 'paper_views' {
    // Handle paper with specific content type if provided
    if (resourceType === 'paper' && contentType) {
      switch (contentType) {
        case 'mcq':
          return 'mcq_attempts'
        case 'saq':
          return 'saq_views'
        case 'osce':
          return 'osce_views'
        case 'spot':
          return 'spot_views'
        default:
          return 'paper_views'
      }
    }

    // Standard resource type mapping
    switch (resourceType) {
      case 'concept':
        return 'concept_views'
      case 'paper':
        return 'paper_views'
      case 'saq':
        return 'saq_views'
      case 'osce':
        return 'osce_views'
      case 'spot':
        return 'spot_views'
      case 'today':
        return 'mcq_attempts' // Today questions are typically MCQs
      default:
        console.warn(`Unexpected resource type: ${resourceType}, defaulting to concept_views`)
        return 'concept_views'
    }
  }

  /**
   * Close all active sessions for a user
   */
  async closeAllActiveSessions(userId: number) {
    const now = DateTime.now()
    const activeSessions = await UserStudySession.query()
      .where('userId', userId)
      .where('isActive', true)

    for (const session of activeSessions) {
      // Calculate additional seconds
      const additionalSeconds = Math.floor(
        Math.abs(session.lastActivityAt.diff(now, 'seconds').seconds)
      )

      // Close session
      await session
        .merge({
          isActive: false,
          lastActivityAt: now,
          durationSeconds: session.durationSeconds + additionalSeconds,
        })
        .save()

      // Update total_seconds in the daily aggregation
      await this.updateTotalTimeForDay(
        userId,
        session.startedAt.toFormat('yyyy-MM-dd'),
        additionalSeconds
      )
    }

    // Invalidate cache after closing sessions
    await this.invalidateTotalStudyTimeCache(userId)
  }

  /**
   * Update total time for a specific day
   */
  private async updateTotalTimeForDay(userId: number, date: string, additionalSeconds: number) {
    await db
      .from('user_study_times')
      .where('user_id', userId)
      .where('date', date)
      .increment('total_seconds', additionalSeconds)
  }

  /**
   * Get total study time for a user (with Redis caching)
   */
  async getTotalStudyTime(userId: number): Promise<number> {
    const cacheKey = `user:study_time:total:${userId}`
    // Try to get from cache
    const cached = await redis.get(cacheKey)
    if (cached !== null) {
      return Number(cached)
    }

    // Close active sessions first to get accurate counts
    await this.closeAllActiveSessions(userId)

    // Get aggregated time from the sessions table
    const result = await db
      .from('user_study_sessions')
      .where('user_id', userId)
      .sum('duration_seconds as total')
      .first()

    const total = Number(result?.total || 0)
    // Cache for 10 minutes
    await redis.setex(cacheKey, 600, total)
    return total
  }

  /**
   * Invalidate cached total study time for a user
   */
  async invalidateTotalStudyTimeCache(userId: number) {
    const cacheKey = `user:study_time:total:${userId}`
    await redis.del(cacheKey)
  }

  /**
   * Static method to invalidate cached total study time for a user (for jobs)
   */
  static async invalidateTotalStudyTimeCacheStatic(userId: number) {
    const cacheKey = `user:study_time:total:${userId}`
    await redis.del(cacheKey)
  }

  /**
   * Format study time into a human-readable string
   */
  formatStudyTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours < 24) {
      if (remainingMinutes === 0) {
        return `${hours}h`
      }
      return `${hours}h ${remainingMinutes}m`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0 && remainingMinutes === 0) {
      return `${days}d`
    }
    return `${days}d ${remainingHours}h ${remainingMinutes}m`
  }

  /**
   * Get study statistics for a specific day
   */
  async getDailyStats(userId: number, date: string) {
    return await UserStudyTime.query().where('userId', userId).where('date', date).first()
  }

  async pauseSession(sessionId: number, _reason: string = 'visibility') {
    const session = await UserStudySession.findOrFail(sessionId)

    if (session.isActive) {
      const now = DateTime.now()
      const additionalSeconds = Math.floor(
        Math.abs(session.lastActivityAt.diff(now, 'seconds').seconds)
      )

      await session
        .merge({
          isActive: false,
          lastActivityAt: now,
          durationSeconds: session.durationSeconds + additionalSeconds,
        })
        .save()

      return session
    }

    return session
  }

  async resumeSession(sessionId: number) {
    const session = await UserStudySession.findOrFail(sessionId)

    if (!session.isActive) {
      await session
        .merge({
          isActive: true,
          lastActivityAt: DateTime.now(),
        })
        .save()
    }

    return session
  }

  async heartbeat(sessionId: number, userId: number) {
    // Find the requested session
    const session = await UserStudySession.findOrFail(sessionId)

    // Check for other active sessions for the same resource
    const activeSessions = await UserStudySession.query()
      .where('userId', userId)
      .where('resourceType', session.resourceType)
      .where('resourceId', session.resourceId)
      .where('isActive', true)
      .whereNot('id', sessionId)

    // If there are multiple active sessions, reconcile them
    if (activeSessions.length > 0) {
      // Close other sessions and consolidate time to this one
      for (const otherSession of activeSessions) {
        session.durationSeconds += otherSession.durationSeconds
        await otherSession.merge({ isActive: false }).save()
      }

      await session.save()

      return {
        sessionId: session.id,
        conflictingSession: true,
      }
    }

    // Update last activity time
    session.lastActivityAt = DateTime.now()
    await session.save()

    return { sessionId: session.id, conflictingSession: false }
  }
}
