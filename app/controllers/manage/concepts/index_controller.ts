import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import {
  createConceptValidator,
  updateConceptValidator,
  updateKnowledgeBlockValidator,
} from '#validators/concept'
import QuestionDto from '#dtos/question'
import { generateSlug } from '#utils/slug_generator'
import ConceptPolicy from '#policies/concept_policy'

export default class ManageConceptsController {
  /**
   * Show root level concepts
   */
  async index({ inertia, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('ConceptPolicy').authorize('view')

    const context = { controller: 'ManageConceptsController', action: 'index' }
    logger.info({ ...context, message: 'Fetching root concepts', userId: auth.user?.id })

    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    logger.info({
      ...context,
      count: concepts.length,
      message: 'Found root concepts',
      userId: auth.user?.id,
    })

    return inertia.render('manage/concepts/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show single concept with its children
   */
  async show({ params, inertia, response, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('ConceptPolicy').authorize('view')

    const context = {
      controller: 'ManageConceptsController',
      action: 'show',
      conceptSlug: params.slug,
      userId: auth.user?.id,
    }

    try {
      logger.info({ ...context, message: 'Fetching concept details' })

      const concept = await Concept.query()
        .where('slug', params.slug)
        .preload('children', (query) => {
          query.select(['id', 'title', 'slug', 'level', 'is_terminal'])
        })
        .preload('questions', (query) => {
          query
            .select(['id', 'type', 'question_text', 'difficulty_level'])
            .orderBy('questions.created_at', 'desc')
            .preload('choices')
            .preload('parts')
        })
        .firstOrFail()

      const content = concept.isTerminal ? concept.knowledgeBlock : null

      logger.info({
        ...context,
        conceptId: concept.id,
        childrenCount: concept.children?.length ?? 0,
        questionsCount: concept.questions?.length ?? 0,
        hasContent: !!content,
        message: 'Retrieved concept details',
      })

      return inertia.render('manage/concepts/show', {
        concept: new ConceptDto(concept),
        children: concept.children ? ConceptDto.fromArray(concept.children) : [],
        questions: concept.questions ? QuestionDto.fromArray(concept.questions) : [],
        content,
      })
    } catch (error) {
      logger.error({
        ...context,
        message: 'Failed to fetch concept',
      })
      return response.redirect().toPath('/manage/concepts')
    }
  }

  async store({ request, auth, response, session, bouncer, logger }: HttpContext) {
    if (await bouncer.with(ConceptPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create concepts')
    }

    const context = {
      controller: 'ManageConceptsController',
      action: 'store',
      userId: auth.user!.id,
    }

    logger.info({ ...context, message: 'Validating concept creation data' })

    const data = await request.validateUsing(createConceptValidator)

    let newLevel = 0
    let parentId = null

    if (data.parentId) {
      logger.info({
        ...context,
        parentSlug: data.parentId,
        message: 'Fetching parent concept',
      })

      const parentConcept = await Concept.findByOrFail('slug', data.parentId)
      newLevel = parentConcept.level + 1
      parentId = parentConcept.id
    }

    const metadata = {
      lastEditedBy: {
        id: auth.user!.id,
        fullName: auth.user!.fullName!,
        timestamp: new Date(),
      },
    }

    const concept = await Concept.create({
      ...data,
      userId: auth.user!.id,
      slug: generateSlug(),
      level: newLevel,
      parentId,
      metadata,
    })

    logger.info({
      ...context,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      parentId,
      level: newLevel,
      message: 'Concept created successfully',
    })

    session.flash('success', `${concept.title} created successfully`)
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async search({ request, response, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('ConceptPolicy').authorize('view')

    const context = {
      controller: 'ManageConceptsController',
      action: 'search',
      query: request.input('q', ''),
      userId: auth.user?.id,
    }

    if (!context.query || context.query.length < 2) {
      return response.json([])
    }

    logger.info({ ...context, message: 'Searching concepts' })

    const results = await Concept.searchConceptByTitle(context.query, 5, true)

    logger.info({
      ...context,
      resultsCount: results.length,
      message: 'Search completed',
    })

    return response.json(results)
  }

  async update({ request, params, response, session, bouncer, auth, logger }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    const context = {
      controller: 'ManageConceptsController',
      action: 'update',
      conceptId: concept.id,
      conceptSlug: concept.slug,
      userId: auth?.user?.id,
    }

    logger.info({ ...context, message: 'Attempting to update concept' })

    if (await bouncer.with(ConceptPolicy).denies('update', concept)) {
      logger.warn({ ...context, message: 'Unauthorized concept update attempt' })
      return response.forbidden('Not authorized to update this concept')
    }

    const data = await request.validateUsing(updateConceptValidator)

    // Update metadata with last editor info
    const metadata = {
      ...concept.metadata,
      lastEditedBy: {
        id: auth.user!.id,
        fullName: auth.user!.fullName!,
        timestamp: new Date(),
      },
    }

    await concept
      .merge({
        ...data,
        isTerminal: data.isTerminal,
        metadata,
      })
      .save()

    logger.info({
      ...context,
      updatedFields: Object.keys(data),
      isTerminal: concept.isTerminal,
      message: 'Concept updated successfully',
    })

    session.flash('success', `${concept.title} updated. Refresh page if necessary`)
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async updateContent({ request, params, response, bouncer, auth, logger }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    const context = {
      controller: 'ManageConceptsController',
      action: 'updateContent',
      conceptId: concept.id,
      conceptSlug: concept.slug,
      userId: auth?.user?.id,
    }

    logger.info({ ...context, message: 'Attempting to update concept content' })

    await bouncer.with('ConceptPolicy').authorize('update', concept)

    const { knowledgeBlock } = await request.validateUsing(updateKnowledgeBlockValidator)

    await concept
      .merge({
        knowledgeBlock: knowledgeBlock || '',
      })
      .save()

    logger.info({
      ...context,
      contentLength: knowledgeBlock?.length ?? 0,
      message: 'Concept content updated successfully',
    })

    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async destroy({ params, response, session, bouncer, logger, auth }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    const context = {
      controller: 'ManageConceptsController',
      action: 'destroy',
      conceptId: concept.id,
      conceptSlug: concept.slug,
      userId: auth?.user?.id,
    }

    logger.info({ ...context, message: 'Attempting to delete concept' })

    if (await bouncer.with(ConceptPolicy).denies('delete', concept)) {
      logger.warn({ ...context, message: 'Unauthorized concept deletion attempt' })
      return response.forbidden('Not authorized to delete this concept')
    }

    await concept.delete()

    logger.info({ ...context, message: 'Concept deleted successfully' })

    session.flash('success', 'Concept deleted. Refresh page if necessary')
    return response.redirect().toPath('/manage/concepts')
  }
}
