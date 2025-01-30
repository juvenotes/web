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

    logger.info('fetching root concepts', {
      userId: auth.user?.id,
      action: 'list_root_concepts',
    })

    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    logger.info('found root concepts', {
      userId: auth.user?.id,
      count: concepts.length,
      action: 'list_root_concepts',
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
    try {
      logger.info('fetching concept details', {
        userId: auth.user?.id,
        conceptSlug: params.slug,
        action: 'view_concept',
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
            .preload('choices')
            .preload('parts')
        })
        .firstOrFail()

      const content = concept.isTerminal ? concept.knowledgeBlock : null

      logger.info('concept details retrieved', {
        userId: auth.user?.id,
        conceptId: concept.id,
        conceptSlug: concept.slug,
        childrenCount: concept.children?.length ?? 0,
        questionsCount: concept.questions?.length ?? 0,
        hasContent: !!content,
        action: 'view_concept',
      })

      return inertia.render('manage/concepts/show', {
        concept: new ConceptDto(concept),
        children: concept.children ? ConceptDto.fromArray(concept.children) : [],
        questions: concept.questions ? QuestionDto.fromArray(concept.questions) : [],
        content,
      })
    } catch (error) {
      logger.error('failed to fetch concept', {
        userId: auth.user?.id,
        conceptSlug: params.slug,
        // we need to update type of error later
        action: 'view_concept',
      })
      return response.redirect().toPath('/manage/concepts')
    }
  }

  async store({ request, auth, response, session, bouncer, logger }: HttpContext) {
    if (await bouncer.with(ConceptPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create concepts')
    }

    logger.info('validating concept creation data', {
      userId: auth.user!.id,
      action: 'create_concept',
    })

    const data = await request.validateUsing(createConceptValidator)

    let newLevel = 0
    let parentId = null

    if (data.parentId) {
      logger.info('fetching parent concept', {
        userId: auth.user!.id,
        parentSlug: data.parentId,
        action: 'create_concept',
      })

      const parentConcept = await Concept.findByOrFail('slug', data.parentId)
      newLevel = parentConcept.level + 1
      parentId = parentConcept.id
    }

    const concept = await Concept.create({
      ...data,
      userId: auth.user!.id,
      slug: generateSlug(),
      level: newLevel,
      parentId,
    })

    logger.info('concept created successfully', {
      userId: auth.user!.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      parentId,
      level: newLevel,
      action: 'create_concept',
    })

    session.flash('success', `${concept.title} created successfuly`)
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async search({ request, response, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('ConceptPolicy').authorize('view')

    const query = request.input('q', '')

    if (!query || query.length < 2) {
      return response.json([])
    }

    logger.info('admin:concepts:search:start', {
      query,
      userId: auth.user?.id,
    })

    const results = await Concept.searchConceptByTitle(request.input('q', ''), 5, true)

    logger.info('admin:concepts:search:complete', {
      query,
      count: results.length,
      userId: auth.user?.id,
    })

    return response.json(results)
  }

  async update({ request, params, response, session, bouncer, auth, logger }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    logger.info('attempting to update concept', {
      userId: auth?.user?.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      action: 'update_concept',
    })

    if (await bouncer.with(ConceptPolicy).denies('update', concept)) {
      logger.warn('unauthorized concept update attempt', {
        userId: auth?.user?.id,
        conceptId: concept.id,
        conceptSlug: concept.slug,
        action: 'update_concept',
      })
      return response.forbidden('Not authorized to update this concept')
    }

    const data = await request.validateUsing(updateConceptValidator)

    await concept
      .merge({
        ...data,
        isTerminal: data.isTerminal,
      })
      .save()

    logger.info('concept updated successfully', {
      userId: auth?.user?.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      updatedFields: Object.keys(data),
      isTerminal: concept.isTerminal,
      action: 'update_concept',
    })

    session.flash('success', `${concept.title} updated successfuly`)
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async updateContent({ request, params, response, bouncer, auth, logger }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    logger.info('attempting to update concept content', {
      userId: auth?.user?.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      action: 'update_concept_content',
    })

    await bouncer.with('ConceptPolicy').authorize('update', concept)

    const { knowledgeBlock } = await request.validateUsing(updateKnowledgeBlockValidator)

    await concept
      .merge({
        knowledgeBlock: knowledgeBlock || '',
      })
      .save()

    logger.info('concept content updated successfully', {
      userId: auth?.user?.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      contentLength: knowledgeBlock?.length ?? 0,
      action: 'update_concept_content',
    })

    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async destroy({ params, response, session, bouncer, logger, auth }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    logger.info('attempting to delete concept', {
      userId: auth?.user?.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      action: 'delete_concept',
    })

    if (await bouncer.with(ConceptPolicy).denies('delete', concept)) {
      logger.warn('unauthorized concept deletion attempt', {
        userId: auth?.user?.id,
        conceptId: concept.id,
        conceptSlug: concept.slug,
        action: 'delete_concept',
      })
      return response.forbidden('Not authorized to delete this concept')
    }

    await concept.delete()

    logger.info('concept deleted successfully', {
      userId: auth?.user?.id,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      action: 'delete_concept',
    })

    session.flash('success', 'Concept deleted successfully')
    return response.redirect().toPath('/manage/concepts')
  }
}
