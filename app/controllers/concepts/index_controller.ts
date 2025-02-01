import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import QuestionDto from '#dtos/question'

export default class IndexController {
  /**
   * Show root level concepts
   */
  async index({ inertia, logger, auth }: HttpContext) {
    logger.info('concepts:index:start', {
      operation: 'fetch_root_concepts',
      filters: { parent_id: null },
      userId: auth.user?.id,
    })

    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    logger.info('concepts:index:complete', {
      operation: 'fetch_root_concepts',
      count: concepts.length,
      levels: concepts.map((c) => c.level),
      userId: auth.user?.id,
    })

    return inertia.render('concepts/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show single concept with its children
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    logger.info('concepts:show:start', {
      operation: 'fetch_concept',
      filters: { slug: params.slug },
    })

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

    logger.info('concepts:show:complete', {
      operation: 'fetch_concept',
      concept: {
        id: concept.id,
        title: concept.title,
        childrenCount: concept.children?.length ?? 0,
        questionsCount: concept.questions?.length ?? 0,
      },
      userId: auth.user?.id,
    })

    return inertia.render('concepts/show', {
      concept: new ConceptDto(concept),
      children: concept.children ? ConceptDto.fromArray(concept.children) : [],
      questions: concept.questions ? QuestionDto.fromArray(concept.questions) : [],
      content: concept.knowledgeBlock,
    })
  }

  async search({ request, response, logger, auth }: HttpContext) {
    const query = request.input('q', '')

    if (!query || query.length < 2) {
      return response.json([])
    }

    logger.info('concepts:search:start', {
      query,
      userId: auth.user?.id,
    })

    const results = await Concept.searchConceptByTitle(request.input('q', ''))

    logger.info('concepts:search:complete', {
      query,
      count: results.length,
      userId: auth.user?.id,
    })

    return response.json(results)
  }
}
