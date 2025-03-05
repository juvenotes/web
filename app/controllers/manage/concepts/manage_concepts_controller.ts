import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import Question from '#models/question'
import ConceptDto from '#dtos/concept'
import {
  createConceptValidator,
  updateConceptValidator,
  updateKnowledgeBlockValidator,
} from '#validators/concept'
import QuestionDto from '#dtos/question'
import { generateSlug } from '#utils/slug_generator'
import ConceptPolicy from '#policies/concept_policy'
import { createMcqQuestionValidator } from '#validators/question'
import { QuestionType } from '#enums/question_types'
import db from '@adonisjs/lucid/services/db'

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
      .select(['id', 'title', 'slug', 'is_terminal', 'level', 'training_level'])

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

  // async search({ request, response, bouncer, logger, auth }: HttpContext) {
  //   await bouncer.with('ConceptPolicy').authorize('view')

  //   const context = {
  //     controller: 'ManageConceptsController',
  //     action: 'search',
  //     query: request.input('q', ''),
  //     userId: auth.user?.id,
  //   }

  //   if (!context.query || context.query.length < 2) {
  //     return response.json([])
  //   }

  //   logger.info({ ...context, message: 'Searching concepts' })

  //   let results
  //   const userId = auth.user!.id

  //   // Try to get cached results with admin context
  //   results = await this.searchCacheService.getCachedResults(context.query, 'admin')

  //   // If no cached results, perform the database query
  //   if (!results) {
  //     results = await Concept.searchConceptByTitle(context.query, 5, true)

  //     // Cache the results
  //     await this.searchCacheService.cacheResults(context.query, results, 'admin')

  //     logger.info({
  //       ...context,
  //       resultsCount: results.length,
  //       message: 'Admin search completed and cached',
  //     })
  //   } else {
  //     logger.info({
  //       ...context,
  //       resultsCount: results.length,
  //       message: 'Admin search returned from cache',
  //     })
  //   }

  //   // Store this as a recent search for the admin
  //   await this.searchCacheService.storeRecentSearch(userId, context.query, 'admin')

  //   return response.json(results)
  // }

  // // fetch recent admin searches
  // async recentSearches({ response, auth, bouncer }: HttpContext) {
  //   await bouncer.with('ConceptPolicy').authorize('view')

  //   if (!auth.user) {
  //     return response.unauthorized()
  //   }

  //   const recentSearches = await this.searchCacheService.getRecentSearches(auth.user.id, 'admin')
  //   return response.json(recentSearches)
  // }

  // async storeSelectedConcept({ request, response, auth, bouncer }: HttpContext) {
  //   await bouncer.with('ConceptPolicy').authorize('view')

  //   if (!auth.user) {
  //     return response.unauthorized()
  //   }

  //   const { title } = request.only(['title'])

  //   if (!title) {
  //     return response.badRequest({ message: 'Concept title is required' })
  //   }

  //   await this.searchCacheService.storeRecentSearch(auth.user.id, title, 'admin')

  //   return response.noContent()
  // }

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

  async addMcq({ request, response, params, auth, session }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)
    const data = await request.validateUsing(createMcqQuestionValidator)
    const slug = generateSlug()

    await db.transaction(async (trx) => {
      const [question] = await trx
        .insertQuery()
        .table('questions')
        .insert({
          user_id: auth.user!.id,
          slug,
          type: QuestionType.MCQ,
          question_text: data.questionText,
        })
        .returning('*')

      await trx
        .insertQuery()
        .table('mcq_choices')
        .insert(
          data.choices.map((choice) => ({
            question_id: question.id,
            choice_text: choice.choiceText,
            is_correct: choice.isCorrect,
            explanation: choice.explanation,
          }))
        )

      await trx.insertQuery().table('concept_questions').insert({
        concept_id: concept.id,
        question_id: question.id,
      })
    })

    session.flash('success', 'MCQ added successfully')
    return response.redirect().back()
  }

  async updateMcq({ request, response, params, auth, session, logger }: HttpContext) {
    const context = {
      controller: 'ManageConceptsController',
      action: 'updateMcq',
      conceptSlug: params.conceptSlug,
      questionSlug: params.questionSlug,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Attempting to update MCQ' })

    try {
      const question = await Question.query().where('slug', params.questionSlug).firstOrFail()

      const data = await request.validateUsing(createMcqQuestionValidator)

      await db.transaction(async (trx) => {
        // Update question text
        await question.merge({ questionText: data.questionText }).useTransaction(trx).save()

        // Delete existing choices
        await trx.from('mcq_choices').where('question_id', question.id).delete()

        // Insert new choices
        await trx
          .insertQuery()
          .table('mcq_choices')
          .insert(
            data.choices.map((choice) => ({
              question_id: question.id,
              choice_text: choice.choiceText,
              is_correct: choice.isCorrect,
              explanation: choice.explanation || null,
            }))
          )
      })

      logger.info({
        ...context,
        questionId: question.id,
        message: 'MCQ updated successfully',
      })

      session.flash('success', 'MCQ updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error({
        ...context,
        error,
        message: 'Failed to update MCQ',
      })

      session.flash('error', 'Failed to update MCQ')
      return response.redirect().back()
    }
  }

  async deleteMcq({ response, params, session }: HttpContext) {
    const question = await Question.findByOrFail('slug', params.questionSlug)
    await question.delete()

    session.flash('success', 'MCQ deleted successfully')
    return response.redirect().back()
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
