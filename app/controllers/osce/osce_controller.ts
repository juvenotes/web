import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import { PaperType } from '#enums/exam_type'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import QuestionDto from '#dtos/question'
import PastPaper from '#models/past_paper'

export default class OsceController {
  async index({ inertia, logger }: HttpContext) {
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

    return inertia.render('osce/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  async show({ inertia, params }: HttpContext) {
    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query.where('paper_type', PaperType.OSCE).orderBy('year', 'desc')
      })
      .firstOrFail()

    return inertia.render('osce/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
    })
  }

  /**
   * View OSCE paper details
   */
  async viewPaper({ params, inertia, logger }: HttpContext) {
    const context = {
      controller: 'OsceController',
      action: 'viewPaper',
      paperSlug: params.paperSlug,
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

    return inertia.render('osce/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
    })
  }
}
