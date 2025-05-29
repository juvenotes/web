import UserStreak from '#models/user_streak'
import { DateTime } from 'luxon'

export default class StreakService {
  /**
   * Update or create streak for a user based on their latest activity.
   * @param userId number
   * @param activityAt DateTime
   */
  public static async updateStreak(userId: number, activityAt: DateTime) {
    let streak = await UserStreak.query().where('user_id', userId).first()
    if (!streak) {
      streak = new UserStreak()
      streak.userId = userId
      streak.currentStreak = 1
      streak.longestStreak = 1
      streak.lastActivityAt = activityAt
      await streak.save()
      return streak
    }
    const lastActivity = streak.lastActivityAt ?? activityAt
    // Only increment streak if last activity was on a previous day
    const lastDate = lastActivity.toISODate()
    const currentDate = activityAt.toISODate()
    if (lastDate !== currentDate) {
      const diff = activityAt.startOf('day').diff(lastActivity.startOf('day'), 'days').days
      if (diff === 1) {
        streak.currentStreak += 1
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak
        }
      } else {
        streak.currentStreak = 1
      }
      streak.lastActivityAt = activityAt
      await streak.save()
    }
    // If activity is on the same day, do not increment streak, but update lastActivityAt
    else {
      streak.lastActivityAt = activityAt
      await streak.save()
    }
    return streak
  }

  /**
   * Kill streaks for users whose last activity was more than 24 hours ago
   */
  public static async killExpiredStreaks() {
    const now = DateTime.now()
    await UserStreak.query()
      .where('last_activity_at', '<', now.minus({ hours: 24 }).toSQL())
      .update({ currentStreak: 0 })
  }

  /**
   * Get the last activity date for a user
   * @param userId number
   * @returns Promise<DateTime | null>
   */
  public static async getLastActivity(userId: number): Promise<DateTime | null> {
    const streak = await UserStreak.query().where('user_id', userId).first()
    return streak?.lastActivityAt ?? null
  }
}
