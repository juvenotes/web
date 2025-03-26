import StatsDto from '#dtos/stats'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import Question from '#models/question'
import { HttpContext } from '@adonisjs/core/http'
import StudyTimeService from '#services/study_time_service'
import { inject } from '@adonisjs/core'

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

    if (auth.user) {
      totalStudyTime = await this.studyTimeService.getTotalStudyTime(auth.user.id)
      formattedStudyTime = this.studyTimeService.formatStudyTime(totalStudyTime)
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
      stats,
      totalStudyTime,
      formattedStudyTime,
    })
  }
}
