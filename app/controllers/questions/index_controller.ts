import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'

export default class IndexController {
  async index({ response }: HttpContext) {
    const rootConcepts = await Concept.query()
      .whereNull('parent_id')
      .select(['id', 'title', 'slug', 'is_terminal'])
      .withCount('questions', (query) => {
        query.as('direct_questions_count')
      })
      .orderBy('level', 'asc')

    return response.json(rootConcepts)
  }

  async show({ params, response }: HttpContext) {
    const concept = await Concept.query()
      .where('slug', params.conceptSlug)
      .select(['id', 'title', 'slug', 'is_terminal'])
      .firstOrFail()

    if (concept.isTerminal) {
      // For terminal concepts, return questions
      await concept.load('questions', (query) => {
        query.select(['id', 'type', 'question_text', 'config', 'marks'])
      })

      return response.json({
        concept,
        questions: concept.questions,
      })
    }

    // For non-terminal concepts, return children with question counts
    const children = await Concept.query()
      .where('parent_id', concept.id)
      .select(['id', 'title', 'slug', 'is_terminal'])
      .withCount('questions', (query) => {
        query.as('direct_questions_count')
      })
      .orderBy('level', 'asc')

    return response.json({
      concept,
      children,
    })
  }
}
