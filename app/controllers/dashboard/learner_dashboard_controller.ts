import { HttpContext } from '@adonisjs/core/http'
import StudyTimeService from '#services/study_time_service'
import { inject } from '@adonisjs/core'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import Question from '#models/question'
import StatsDto from '#dtos/stats'
import User from '#models/user'
import UserDto from '#dtos/user'
import UserStreakDto from '#dtos/user_streak'
import redis from '@adonisjs/redis/services/main'

@inject()
export default class DashboardController {
  constructor(protected studyTimeService: StudyTimeService) { }

  async handle({ inertia, logger, auth }: HttpContext) {
    logger.info('Rendering dashboard', {
      controller: 'DashboardController',
      action: 'handle',
      view: 'dashboard',
      userId: auth.user?.id,
    })

    // Get total study time for the user
    let totalStudyTime = 0
    let formattedStudyTime = '0m'
    let todayStudyTime = 0
    let formattedTodayStudyTime = '0m'
    let userDto = null

    if (auth.user && auth.user.id) {
      try {
        totalStudyTime = await this.studyTimeService.getTotalStudyTime(auth.user.id)
        if (typeof totalStudyTime !== 'number' || Number.isNaN(totalStudyTime)) {
          totalStudyTime = 0
        }
        formattedStudyTime = this.studyTimeService.formatStudyTime(totalStudyTime)

        // Fetch today's study time
        const today = new Date().toISOString().split('T')[0]
        const todayStats = await this.studyTimeService.getDailyStats(auth.user.id, today)
        todayStudyTime = todayStats?.totalSeconds || 0
        formattedTodayStudyTime = this.studyTimeService.formatStudyTime(todayStudyTime)
      } catch (error) {
        logger.error('Failed to fetch study time', { error, userId: auth.user.id })
        totalStudyTime = 0
        formattedStudyTime = '0m'
        todayStudyTime = 0
        formattedTodayStudyTime = '0m'
      }

      let user = await User.query().where('id', auth.user.id).preload('streak').first()
      let streak = null
      if (user && user.streak) {
        streak = new UserStreakDto(user.streak)
      }
      userDto = new UserDto(user ?? undefined, streak)
    }

    // Get cached or fresh dashboard stats
    const stats = await this.getDashboardStats(logger)

    return inertia.render('dashboard', {
      user: userDto,
      stats,
      totalStudyTime,
      formattedStudyTime,
      todayStudyTime,
      formattedTodayStudyTime,
    })
  }

  /**
   * Get dashboard stats with Redis caching (5 minute TTL)
   */
  private async getDashboardStats(logger: HttpContext['logger']): Promise<StatsDto> {
    const cacheKey = 'dashboard:stats'

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      logger.debug('Dashboard stats loaded from cache')
      return JSON.parse(cached) as StatsDto
    }

    // Cache miss - fetch fresh data
    const [rootConcepts, contentfulConcepts, questionCount, paperCount] = await Promise.all([
      Concept.query().where('level', 0).count('* as total').first(),
      Concept.query()
        .whereNotNull('knowledge_block')
        .where('knowledge_block', '!=', '')
        .count('* as total')
        .first(),
      Question.query().count('* as total').first(),
      PastPaper.query().count('* as total').first(),
    ])

    const stats = new StatsDto({
      concepts: Number(rootConcepts?.$extras.total) || 0,
      contentfulConcepts: Number(contentfulConcepts?.$extras.total) || 0,
      questions: Number(questionCount?.$extras.total) || 0,
      papers: Number(paperCount?.$extras.total) || 0,
    })

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(stats))
    logger.debug('Dashboard stats cached')

    return stats
  }
}
