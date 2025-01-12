import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'

export default class IndexController {
  async index({ response }: HttpContext) {
    const concepts = await Concept.query()
      .where('level', 0)
      .preload('pastPapers', (query) => {
        query.preload('questions').orderBy('year', 'desc')
      })

    return response.json(concepts)
  }
}
