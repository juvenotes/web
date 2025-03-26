import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import StudyTimeService from '#services/study_time_service'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class UserProgressController {
  constructor(private studyTimeService: StudyTimeService) {}

  /**
   * Get study time stats for the authenticated user
   */
  async getStudyTime({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Get total study time
      const totalStudyTime = await this.studyTimeService.getTotalStudyTime(user.id)

      // Get today's stats
      const today = new Date().toISOString().split('T')[0]
      const todayStats = await db
        .from('user_study_times')
        .where('user_id', user.id)
        .where('date', today)
        .first()

      return {
        totalSeconds: totalStudyTime,
        formattedTotal: this.studyTimeService.formatStudyTime(totalStudyTime),
        today: {
          seconds: todayStats?.total_seconds || 0,
          formatted: this.studyTimeService.formatStudyTime(todayStats?.total_seconds || 0),
          activities: {
            concepts: todayStats?.concept_views || 0,
            mcqs: todayStats?.mcq_attempts || 0,
            saqs: todayStats?.saq_views || 0,
            osces: todayStats?.osce_views || 0,
            spots: todayStats?.spot_views || 0,
            papers: todayStats?.paper_views || 0,
          },
        },
      }
    } catch (error) {
      console.error('Error fetching study stats:', error)
      return response.status(500).json({ error: 'Failed to fetch study statistics' })
    }
  }
}
