import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import { PaperType } from '#enums/exam_type'
import ConceptDto from '#dtos/concept'

export default class OsceController {
  async view({ inertia, logger }: HttpContext) {
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
      concept,
    })
  }
}
