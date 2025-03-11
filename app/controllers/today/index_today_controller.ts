import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Today from '#models/today'
import TodayDto from '#dtos/today'
import QuestionDto from '#dtos/question'
import { TodayStatus } from '#enums/today_status'

@inject()
export default class IndexTodayController {
  /**
   * Display the active Question of the Day
   */
  async index({ inertia, logger, auth, bouncer }: HttpContext) {
    const context = { controller: 'IndexTodayController', action: 'index' }
    logger.info({ ...context, message: 'Fetching active question of the day' })

    // Find the most recent active Today item
    const today = await Today.query()
      .where('status', TodayStatus.ACTIVE)
      .orderBy('scheduled_for', 'desc')
      .preload('questions', (query) => {
        query.preload('choices')
      })
      .first()

    // Use bouncer for permissions
    const canManage = await bouncer.allows('canManage')

    logger.info({
      ...context,
      userId: auth.user?.id,
      todayId: today?.id,
      questionsCount: today?.questions?.length || 0,
      message: today ? 'Found active question of the day' : 'No active question of the day found',
    })

    return inertia.render('today/index', {
      today: today ? new TodayDto(today) : null,
      questions: today?.questions ? QuestionDto.fromArray(today.questions) : [],
      canManage,
      isActive: !!today,
    })
  }
}
