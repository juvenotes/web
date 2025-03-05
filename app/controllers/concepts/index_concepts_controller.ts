import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import QuestionDto from '#dtos/question'

export default class IndexConceptsController {
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

    const parentConcepts = await this.getConceptParents(concept.id)

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
      parentConcepts: ConceptDto.fromArray(parentConcepts),
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

  // async search({ request, response, logger, auth }: HttpContext) {
  //   const context = {
  //     controller: 'ConceptsIndexController',
  //     action: 'search',
  //     query: request.input('q', ''),
  //   }

  //   if (!context.query || context.query.length < 2) {
  //     logger.info({
  //       ...context,
  //       message: 'Search skipped - query too short',
  //       userId: auth.user?.id,
  //     })
  //     return response.json([])
  //   }

  //   logger.info({ ...context, message: 'Searching concepts' })

  //   let results
  //   const userId = auth.user?.id ?? 0

  //   // Try to get cached results
  //   results = await this.searchCacheService.getCachedResults(context.query)

  //   // If no cached results, perform the database query
  //   if (!results) {
  //     results = await Concept.searchConceptByTitle(context.query)

  //     // Cache the results
  //     await this.searchCacheService.cacheResults(context.query, results)

  //     logger.info({
  //       ...context,
  //       resultsCount: results.length,
  //       message: 'DB search completed and cached',
  //       userId,
  //     })
  //   } else {
  //     logger.info({
  //       ...context,
  //       resultsCount: results.length,
  //       message: 'Search returned from cache',
  //       userId,
  //     })
  //   }

  //   // Store this as a recent search for logged-in users
  //   if (auth.user) {
  //     await this.searchCacheService.storeRecentSearch(userId, context.query)
  //   }

  //   return response.json(results)
  // }

  // async recentSearches({ response, auth }: HttpContext) {
  //   if (!auth.user) {
  //     return response.unauthorized()
  //   }

  //   const recentSearches = await this.searchCacheService.getRecentSearches(auth.user.id)
  //   return response.json(recentSearches)
  // }

  // async storeSelectedConcept({ request, response, auth }: HttpContext) {
  //   if (!auth.user) {
  //     return response.unauthorized()
  //   }

  //   const { title } = request.only(['title'])

  //   if (!title) {
  //     return response.badRequest({ message: 'Concept title is required' })
  //   }

  //   await this.searchCacheService.storeRecentSearch(auth.user.id, title)

  //   return response.noContent()
  // }

  private async getConceptParents(conceptId: number) {
    const parents: Concept[] = []
    let currentConcept = await Concept.query()
      .where('id', conceptId)
      .select(['id', 'title', 'slug', 'parent_id'])
      .first()

    // If no parent_id, return empty array
    if (!currentConcept || currentConcept.parentId === null) {
      return parents
    }

    // Use a simplified approach to minimize database queries
    while (currentConcept && currentConcept.parentId !== null) {
      // Get the parent concept
      const parent = await Concept.query()
        .where('id', currentConcept.parentId)
        .select(['id', 'title', 'slug', 'parent_id'])
        .first()

      if (parent) {
        // Add to start to maintain root->leaf order
        parents.unshift(parent)
        currentConcept = parent
      } else {
        // Break if parent not found (shouldn't happen with proper data integrity)
        break
      }
    }

    return parents
  }
}
