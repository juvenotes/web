import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import QuestionDto from '#dtos/question'

export default class IndexController {
  /**
   * Show root level concepts
   */
  async index({ inertia, logger, auth, bouncer }: HttpContext) {
    const context = { controller: 'ConceptsIndexController', action: 'index' }
    logger.info({ ...context, message: 'Fetching root level concepts' })

    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level', 'training_level'])

    logger.info({
      ...context,
      conceptsCount: concepts.length,
      levelsCount: new Set(concepts.map((c) => c.level)).size,
      message: 'Retrieved root level concepts',
      userId: auth.user?.id,
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('concepts/index', {
      concepts: ConceptDto.fromArray(concepts),
      canManage,
    })
  }

  /**
   * Show single concept with its children
   */
  async show({ params, inertia, logger, auth, bouncer }: HttpContext) {
    const context = {
      controller: 'ConceptsIndexController',
      action: 'show',
      conceptSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching concept and related data' })

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

    logger.info({
      ...context,
      conceptTitle: concept.title,
      childrenCount: concept.children?.length ?? 0,
      questionsCount: concept.questions?.length ?? 0,
      message: 'Retrieved concept with children and questions',
      userId: auth.user?.id,
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('concepts/show', {
      concept: new ConceptDto(concept),
      children: concept.children ? ConceptDto.fromArray(concept.children) : [],
      questions: concept.questions ? QuestionDto.fromArray(concept.questions) : [],
      content: concept.knowledgeBlock,
      canManage,
    })
  }

  async search({ request, response, logger, auth }: HttpContext) {
    const context = {
      controller: 'ConceptsIndexController',
      action: 'search',
      query: request.input('q', ''),
    }

    if (!context.query || context.query.length < 2) {
      logger.info({
        ...context,
        message: 'Search skipped - query too short',
        userId: auth.user?.id,
      })
      return response.json([])
    }

    logger.info({ ...context, message: 'Searching concepts' })

    const results = await Concept.searchConceptByTitle(context.query)

    logger.info({
      ...context,
      resultsCount: results.length,
      message: 'Search completed',
      userId: auth.user?.id,
    })

    return response.json(results)
  }
}
