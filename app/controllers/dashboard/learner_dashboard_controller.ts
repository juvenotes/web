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

@inject()
export default class DashboardController {
  constructor(protected studyTimeService: StudyTimeService) {}

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

    return inertia.render('dashboard', {
      user: userDto,
      stats,
      totalStudyTime,
      formattedStudyTime,
      todayStudyTime,
      formattedTodayStudyTime,
    })
  }
}
