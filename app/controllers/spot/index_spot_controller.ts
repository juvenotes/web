import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import { PaperType } from '#enums/exam_type'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import QuestionDto from '#dtos/question'
import PastPaper from '#models/past_paper'
import { inject } from '@adonisjs/core'
import UserProgressService from '#services/user_progress_service'

@inject()
export default class IndexSpotController {
  constructor(private userProgressService: UserProgressService) {}

  /**
   * Show all concepts with SPOT papers
   */
  async index({ inertia, logger, bouncer }: HttpContext) {
    const context = { controller: 'IndexSpotController', action: 'index' }
    logger.info({ ...context, message: 'Fetching concepts with SPOT papers' })

    const concepts = await Concept.query()
      .where('level', 0)
      .where('has_spot', true)
      .select(['id', 'title', 'slug', 'level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .where('paper_type', PaperType.SPOT)
          .orderBy('year', 'desc')
      })

    logger.info({
      ...context,
      conceptsCount: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      message: 'Retrieved concepts with SPOT papers',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('spot/index', {
      concepts: ConceptDto.fromArray(concepts),
      canManage,
    })
  }

  /**
   * View concept with its SPOT papers
   */
  async show({ inertia, params, bouncer, logger, auth }: HttpContext) {
    const context = {
      controller: 'IndexSpotController',
      action: 'show',
      conceptSlug: params.slug,
      userId: auth.user?.id,
    }
    logger.info({ ...context, message: 'Fetching concept with SPOT papers' })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query.where('paper_type', PaperType.SPOT).orderBy('year', 'desc')
      })
      .firstOrFail()

    logger.info({
      ...context,
      conceptId: concept.id,
      conceptTitle: concept.title,
      papersCount: concept.pastPapers?.length ?? 0,
      message: 'Found concept with SPOT papers',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('spot/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
      canManage,
    })
  }

  /**
   * View SPOT paper details
   */
  async viewPaper({ params, inertia, logger, bouncer, auth }: HttpContext) {
    const context = {
      controller: 'IndexSpotController',
      action: 'viewPaper',
      conceptSlug: params.conceptSlug,
      paperSlug: params.paperSlug,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Fetching SPOT paper details' })

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .where('paper_type', PaperType.SPOT)
      .preload('concept')
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('spotStations')
      })
      .firstOrFail()

    logger.info({
      ...context,
      paperId: paper.id,
      conceptId: paper.concept.id,
      questionsCount: paper.questions?.length ?? 0,
      message: 'Found SPOT paper details',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('spot/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
      canManage,
    })
  }

  /**
   * Record user's interaction with SPOT station
   */
  async recordSpotResponse({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized()
    }

    const { paperId, questionId, stationId } = request.only(['paperId', 'questionId', 'stationId'])

    await this.userProgressService.recordSpotStationView(
      auth.user.id,
      paperId,
      questionId,
      stationId
    )

    return response.ok({ success: true })
  }
}
