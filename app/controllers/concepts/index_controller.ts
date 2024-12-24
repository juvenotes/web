import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'

export default class IndexController {
  /**
   * Show root level concepts
   */
  async index({ response }: HttpContext) {
    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    return response.json(concepts)
  }

  /**
   * Show single concept with its children
   */
  async show({ params, response }: HttpContext) {
    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('questions', (query) => {
        query
          .select(['id', 'type', 'question_text', 'config', 'marks'])
          .orderBy('created_at', 'desc')
      })
      .firstOrFail()

    if (concept.isTerminal) {
      return response.json({
        concept: {
          ...concept.serialize(),
          questions: concept.questions,
          content: concept.knowledgeBlock,
        },
      })
    }

    // For non-terminal nodes, don't include questions
    const children = await Concept.query()
      .where('parent_id', concept.id)
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    return response.json({
      concept: concept.serialize(),
      children,
    })
  }
}
