import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import QuestionDto from '#dtos/question'

export default class IndexController {
  /**
   * Show root level concepts
   */
  async index({ inertia }: HttpContext) {
    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    // return response.json(concepts)
    return inertia.render('concepts/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show single concept with its children
   */
  async show({ params, inertia }: HttpContext) {
    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('children', (query) => {
        query.select(['id', 'title', 'slug', 'level', 'is_terminal'])
      })
      .preload('questions', (query) => {
        query
          .select(['id', 'type', 'question_text', 'difficulty_level'])
          .orderBy('questions.created_at', 'desc')
          .preload('choices', (choicesQuery) => {
            choicesQuery.select(['id', 'choice_text', 'is_correct', 'explanation'])
          })
          .preload('parts', (partsQuery) => {
            partsQuery.select(['id', 'part_text', 'expected_answer', 'marks'])
          })
      })
      .firstOrFail()

    return inertia.render('concepts/show', {
      concept: new ConceptDto(concept),
      children: concept.children ? ConceptDto.fromArray(concept.children) : [],
      questions: concept.questions ? QuestionDto.fromArray(concept.questions) : [],
      content: concept.knowledgeBlock,
    })
  }
}
