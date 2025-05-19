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
export default class OsceController {
  constructor(private userProgressService: UserProgressService) {}

  async index({ inertia, logger, bouncer }: HttpContext) {
    const context = { controller: 'OsceController', action: 'view' }
    logger.info({ ...context, message: 'Fetching concepts with OSCE papers' })

    const concepts = await Concept.query()
      .where('level', 0)
      .where('has_osce', true)
      .select(['id', 'title', 'slug', 'level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .orderBy('year', 'desc')
      })

    logger.info({
      ...context,
      conceptsCount: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      message: 'Retrieved concepts with OSCE papers',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('osce/index', {
      concepts: ConceptDto.fromArray(concepts),
      canManage,
    })
  }

  async show({ inertia, params, bouncer, logger, auth }: HttpContext) {
    const context = {
      controller: 'OsceController',
      action: 'show',
      conceptSlug: params.slug,
      userId: auth.user?.id,
    }
    logger.info({ ...context, message: 'Fetching concept with OSCE papers' })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query
          .where('paper_type', PaperType.OSCE)
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .orderBy('year', 'desc')
          .preload('questions', (q) => q.preload('stations'))
      })
      .firstOrFail()

    logger.info({
      ...context,
      message: 'Found OSCE paper details',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('osce/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
      canManage,
    })
  }

  /**
   * View OSCE paper details
   */
  async viewPaper({ params, inertia, logger, bouncer, auth }: HttpContext) {
    const context = {
      controller: 'OsceController',
      action: 'viewPaper',
      conceptSlug: params.conceptSlug,
      paperSlug: params.paperSlug,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Fetching OSCE paper details' })

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .where('paper_type', PaperType.OSCE)
      .preload('concept')
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('stations')
      })
      .firstOrFail()

    logger.info({
      ...context,
      paperId: paper.id,
      conceptId: paper.concept.id,
      questionsCount: paper.questions?.length ?? 0,
      message: 'Found OSCE paper details',
    })

    const canManage = await bouncer.allows('canManage')

    // Default values
    let progress = null
    let completionPercentage = 0
    let attemptCount = 0

    if (auth.user) {
      // Record paper view
      await this.userProgressService.recordPaperView(auth.user.id, paper.id, 'osce')
      // Get user progress
      progress = await this.userProgressService.getPaperProgress(auth.user.id, paper.id)
      // Get completion percentage
      completionPercentage = await this.userProgressService.getCompletionPercentage(
        auth.user.id,
        paper.id
      )
      // Get attempt count from progress, fallback to 0
      attemptCount = progress?.attemptCount || 0
    }

    return inertia.render('osce/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
      canManage,
      progress,
      completionPercentage,
      attemptCount,
    })
  }
}
