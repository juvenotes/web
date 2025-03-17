import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import { createPastPaperValidator, updatePastPaperValidator } from '#validators/past_paper'
import { generateSlug } from '#utils/slug_generator'
import PastPaperPolicy from '#policies/paper_policy'
import { PaperType } from '#enums/exam_type'
import QuestionDto from '#dtos/question'
import { QuestionType } from '#enums/question_types'
import Question from '#models/question'
import db from '@adonisjs/lucid/services/db'
import { createSpotQuestionValidator, updateSpotQuestionValidator } from '#validators/question'
import QuestionDeletionService from '#services/question_deletion_service'
import PaperDeletionService from '#services/paper_deletion_service'

export default class ManageSpotController {
  private getMetadataUpdate(currentMetadata: any, auth: HttpContext['auth']) {
    return {
      ...currentMetadata,
      lastEditedBy: {
        fullName: auth.user!.fullName!,
        timestamp: new Date(),
      },
    }
  }

  /**
   * Show root level concepts with SPOT papers
   */
  async index({ inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'index',
    }
    logger.info({ ...context, message: 'Fetching root concepts with SPOT papers' })

    const concepts = await Concept.query()
      .where('level', 0)
      .where('has_spot', true)
      .select(['id', 'title', 'slug'])
      .preload('pastPapers', (query) => {
        query
          .where('paper_type', PaperType.SPOT)
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
      })

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      message: 'Found root concepts with SPOT papers',
    })

    return inertia.render('manage/spot/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show concept details with its SPOT papers
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'show',
      conceptSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching concept with SPOT papers' })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query
          .where('paper_type', PaperType.SPOT)
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .orderBy('year', 'desc')
      })
      .firstOrFail()

    logger.info({
      ...context,
      userId: auth.user?.id,
      conceptId: concept.id,
      conceptTitle: concept.title,
      papersCount: concept.pastPapers?.length ?? 0,
      message: 'Retrieved concept with SPOT papers',
    })

    return inertia.render('manage/spot/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
    })
  }

  /**
   * Store a new SPOT paper
   */
  async store({ request, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'store',
    }
    logger.info({ ...context, message: 'Creating new SPOT paper' })

    const data = await request.validateUsing(createPastPaperValidator)

    // Create paper with SPOT type
    const paper = await PastPaper.create({
      ...data,
      userId: auth.user!.id,
      paperType: PaperType.SPOT,
      slug: generateSlug(),
      metadata: {
        lastEditedBy: {
          fullName: auth.user!.fullName!,
          timestamp: new Date(),
        },
      },
    })

    // Update concept to indicate it has SPOT papers
    await Concept.query().where('id', data.conceptId).update({ hasSpot: true })

    // Get the concept for the redirect path
    const concept = await Concept.findOrFail(data.conceptId)

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      conceptId: data.conceptId,
      message: 'SPOT paper created successfully',
    })

    session.flash('success', 'SPOT paper created successfully')
    return response.redirect().toPath(`/manage/spot/${concept.slug}/${paper.slug}`)
  }

  /**
   * Update a SPOT paper
   */
  async update({ params, request, response, bouncer, auth, logger }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'update',
      paperSlug: params.paperSlug,
    }
    logger.info({ ...context, message: 'Updating SPOT paper' })

    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)

    if (await bouncer.with(PastPaperPolicy).denies('update', paper)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        paperId: paper.id,
        message: 'Unauthorized update attempt',
      })
      return response.forbidden('Cannot update this SPOT paper')
    }

    const data = await request.validateUsing(updatePastPaperValidator)

    await paper
      .merge({
        ...data,
        metadata: this.getMetadataUpdate(paper.metadata, auth),
      })
      .save()

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      conceptId: paper.conceptId,
      message: 'SPOT paper updated successfully',
    })

    return response.redirect().back()
  }

  /**
   * Show SPOT paper details for management
   */
  async viewSpotPaper({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'viewSpotPaper',
      conceptSlug: params.conceptSlug,
      paperSlug: params.paperSlug,
    }
    logger.info({ ...context, message: 'Fetching SPOT paper details for management' })

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .where('paper_type', PaperType.SPOT)
      .preload('concept')
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('spotStations')
      })
      .firstOrFail()

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      conceptId: paper.conceptId,
      questionsCount: paper.questions?.length ?? 0,
      message: 'Retrieved SPOT paper details',
    })

    return inertia.render('manage/spot/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
    })
  }

  /**
   * Add a new SPOT question
   */
  async addQuestion({ request, response, params, auth, session, logger }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'addQuestion',
      paperSlug: params.paperSlug,
    }
    logger.info({ ...context, message: 'Adding new SPOT question' })

    try {
      const paper = await PastPaper.findByOrFail('slug', params.paperSlug)
      const data = await request.validateUsing(createSpotQuestionValidator)

      await db.transaction(async (trx) => {
        // Create question
        const question = await Question.create({
          userId: auth.user!.id,
          type: QuestionType.SPOT,
          questionText: data.questionText,
          questionImagePath: data.questionImagePath,
          slug: generateSlug(),
          pastPaperId: paper.id,
        })

        // Create stations
        for (const stationData of data.parts) {
          await trx
            .insertQuery()
            .table('spot_stations')
            .insert({
              question_id: question.id,
              part_text: stationData.partText,
              expected_answer: stationData.expectedAnswer,
              marks: stationData.marks,
              image_path: stationData.imagePath || null,
            })
        }

        // Update paper metadata
        await paper
          .merge({
            metadata: this.getMetadataUpdate(paper.metadata, auth),
          })
          .useTransaction(trx)
          .save()

        // Add topics and units if provided
        if (data.topicIds && data.topicIds.length > 0) {
          await trx
            .insertQuery()
            .table('question_topics')
            .multiInsert(
              data.topicIds.map((topicId) => ({
                question_id: question.id,
                topic_id: topicId,
              }))
            )
        }

        if (data.unitIds && data.unitIds.length > 0) {
          await trx
            .insertQuery()
            .table('question_units')
            .multiInsert(
              data.unitIds.map((unitId) => ({
                question_id: question.id,
                unit_id: unitId,
              }))
            )
        }
      })

      logger.info({
        ...context,
        userId: auth.user?.id,
        paperId: paper.id,
        message: 'SPOT question added successfully',
      })

      session.flash('success', 'SPOT question added successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to add spot question', { error })
      throw error
    }
  }

  /**
   * Update a SPOT question
   */
  async updateQuestion({ params, request, response, auth, session, logger }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'updateQuestion',
      paperSlug: params.paperSlug,
      questionSlug: params.questionSlug,
    }
    logger.info({ ...context, message: 'Updating SPOT question' })

    try {
      // Load question with pastPaper relationship
      const question = await Question.query()
        .where('slug', params.questionSlug)
        .preload('pastPaper')
        .preload('spotStations')
        .firstOrFail()

      const data = await request.validateUsing(updateSpotQuestionValidator)

      await db.transaction(async (trx) => {
        // Update question basic properties
        await question
          .merge({
            questionText: data.questionText,
            questionImagePath: data.questionImagePath,
          })
          .useTransaction(trx)
          .save()

        // Delete existing stations
        await trx.from('spot_stations').where('question_id', question.id).delete()

        // Create new stations
        for (const stationData of data.parts) {
          await trx
            .insertQuery()
            .table('spot_stations')
            .insert({
              question_id: question.id,
              part_text: stationData.partText,
              expected_answer: stationData.expectedAnswer,
              marks: stationData.marks,
              image_path: stationData.imagePath || null,
            })
        }

        // Update paper metadata
        await question.pastPaper
          .merge({
            metadata: this.getMetadataUpdate(question.pastPaper.metadata, auth),
          })
          .useTransaction(trx)
          .save()

        // Update topics and units
        await trx.from('question_topics').where('question_id', question.id).delete()
        await trx.from('question_units').where('question_id', question.id).delete()

        if (data.topicIds && data.topicIds.length > 0) {
          await trx
            .insertQuery()
            .table('question_topics')
            .multiInsert(
              data.topicIds.map((topicId) => ({
                question_id: question.id,
                topic_id: topicId,
              }))
            )
        }

        if (data.unitIds && data.unitIds.length > 0) {
          await trx
            .insertQuery()
            .table('question_units')
            .multiInsert(
              data.unitIds.map((unitId) => ({
                question_id: question.id,
                unit_id: unitId,
              }))
            )
        }
      })

      logger.info({
        ...context,
        userId: auth.user?.id,
        questionId: question.id,
        message: 'SPOT question updated successfully',
      })

      session.flash('success', 'SPOT question updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to update spot question', { error })
      throw error
    }
  }

  /**
   * Delete a SPOT question
   */
  async deleteQuestion({ params, response, auth, session, logger }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'deleteQuestion',
      questionSlug: params.questionSlug,
    }
    logger.info({ ...context, message: 'Deleting SPOT question' })

    try {
      // Load question with pastPaper relationship
      const question = await Question.query()
        .where('slug', params.questionSlug)
        .preload('pastPaper')
        .firstOrFail()

      await db.transaction(async (trx) => {
        // Update paper metadata
        await question.pastPaper
          .merge({
            metadata: this.getMetadataUpdate(question.pastPaper.metadata, auth),
          })
          .useTransaction(trx)
          .save()

        // Use the question service for soft deletion
        await QuestionDeletionService.delete(question.id)
      })

      logger.info({
        ...context,
        userId: auth.user?.id,
        questionId: question.id,
        message: 'SPOT question deleted successfully',
      })

      session.flash('success', 'Question deleted successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to delete spot question', { error })
      throw error
    }
  }

  /**
   * Delete a SPOT paper
   */
  async destroy({ params, response, session, bouncer, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageSpotController',
      action: 'destroy',
      paperSlug: params.paperSlug,
    }

    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)

    if (await bouncer.with(PastPaperPolicy).denies('delete', paper)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        paperId: paper.id,
        message: 'Unauthorized deletion attempt',
      })
      return response.forbidden('Cannot delete this SPOT paper')
    }

    // Use soft deletion service instead of hard delete
    await PaperDeletionService.delete(paper.id)

    // Check if concept still has any SPOT papers
    const remainingSpots = await PastPaper.query()
      .where('concept_id', paper.conceptId)
      .where('paper_type', PaperType.SPOT)
      .whereNull('deleted_at') // Only count non-deleted papers
      .first()

    if (!remainingSpots) {
      // Update concept has_spot flag
      const concept = await Concept.findOrFail(paper.conceptId)
      await concept.merge({ hasSpot: false }).save()
    }

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      conceptId: paper.conceptId,
      message: 'SPOT paper deleted successfully',
    })

    session.flash('success', 'SPOT paper deleted successfully')
    return response.redirect().toPath(`/manage/spot/${params.conceptSlug}`)
  }
}
