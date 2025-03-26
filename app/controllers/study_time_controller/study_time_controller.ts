import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import StudyTimeService from '#services/study_time_service'

@inject()
export default class StudyTimeController {
  constructor(protected studyTimeService: StudyTimeService) {}

  async store({ request, auth }: HttpContext) {
    const user = auth.user!
    const { time } = request.only(['time'])

    await user
      .merge({
        total_study_time: user.total_study_time + time,
      })
      .save()

    return { success: true }
  }

  async create({ request, response, auth }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }

    const { resourceType, resourceId, contentType } = request.body()

    try {
      const result = await this.studyTimeService.recordActivity(
        auth.user.id,
        resourceType,
        resourceId,
        contentType
      )
      return response.ok(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return response.internalServerError({
        error: 'Failed to create session',
        message: errorMessage,
      })
    }
  }

  async pauseSession({ request, response, params, auth }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }

    const sessionId = params.id
    const { reason = 'visibility' } = request.body()

    try {
      const result = await this.studyTimeService.pauseSession(sessionId, reason)
      return response.ok(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return response.internalServerError({
        error: 'Failed to pause session',
        message: errorMessage,
      })
    }
  }

  async resumeSession({ response, params, auth }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }

    const sessionId = params.id

    try {
      const result = await this.studyTimeService.resumeSession(sessionId)
      return response.ok(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return response.internalServerError({
        error: 'Failed to resume session',
        message: errorMessage,
      })
    }
  }

  async heartbeat({ response, params, auth }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }

    const sessionId = params.id

    try {
      const result = await this.studyTimeService.heartbeat(sessionId, auth.user.id)
      return response.ok(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return response.internalServerError({
        error: 'Failed to process heartbeat',
        message: errorMessage,
      })
    }
  }
}
