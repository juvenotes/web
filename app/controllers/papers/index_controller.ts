import type { HttpContext } from '@adonisjs/core/http'
import Paper from '#models/past_paper'
import Concept from '#models/concept'
import { ConceptPapersSummaryDto } from '#dtos/concept_papers_summary_dto'
import { PaperDetailsDto } from '#dtos/paper_details_dto'

export default class IndexController {
  async index({ inertia }: HttpContext) {
    const concepts = await Concept.query()
      .where('level', 0)
      .preload('pastPapers', (query) => {
        query.preload('questions').orderBy('year', 'desc')
      })

    return inertia.render('papers/index', {
      concepts: concepts.map((concept) => new ConceptPapersSummaryDto(concept).toJSON()),
    })
  }

  async show({ params, inertia }: HttpContext) {
    const paper = await Paper.query()
      .where('slug', params.slug)
      .preload('questions', (query) => {
        query.preload('choices').preload('parts')
      })
      .preload('concept')
      .firstOrFail()

    return inertia.render('papers/show', {
      paper: new PaperDetailsDto(paper).toJSON(),
    })
  }
}
