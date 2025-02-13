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
import { createOsceQuestionValidator, updateOsceQuestionValidator } from '#validators/question'

export default class ManageOsceController {
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
   * Show root level concepts with OSCE papers
   */
  async index({ inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageOsceController',
      action: 'index',
    }
    logger.info({ ...context, message: 'Fetching root concepts with OSCE papers' })

    const concepts = await Concept.query()
      .where('level', 0)
      .where('has_osce', true)
      .select(['id', 'title', 'slug'])
      .preload('pastPapers', (query) => {
        query
          .where('paper_type', PaperType.OSCE)
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
      })

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      message: 'Found root concepts with OSCE papers',
    })

    return inertia.render('manage/osce/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show concept details with its OSCE papers
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageOsceController',
      action: 'show',
      conceptSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching concept with OSCE papers' })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query
          .where('paper_type', PaperType.OSCE)
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
      message: 'Found concept with OSCE papers',
    })

    return inertia.render('manage/osce/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
    })
  }

  /**
   * Store a new OSCE paper
   */
  async store({ request, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageOsceController',
      action: 'store',
    }
    logger.info({ ...context, message: 'Creating new OSCE paper' })

    const data = await request.validateUsing(createPastPaperValidator)

    const concept = await Concept.findOrFail(data.conceptId)
    const paper = await PastPaper.create({
      ...data,
      userId: auth.user!.id,
      paperType: PaperType.OSCE,
      slug: generateSlug(),
      metadata: {
        lastEditedBy: {
          fullName: auth.user!.fullName!,
          timestamp: new Date(),
        },
      },
    })

    // Update concept has_osce flag if needed
    if (!concept.hasOsce) {
      await concept.merge({ hasOsce: true }).save()
    }

    logger.info({
      ...context,
      userId: auth.user!.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      message: 'OSCE paper created successfully',
    })

    session.flash('success', 'OSCE paper created successfully')
    return response.redirect().toPath(`/manage/osce/${concept.slug}/${paper.slug}`)
  }

  /**
   * Update an OSCE paper
   */
  async update({ params, request, response, bouncer, auth, logger }: HttpContext) {
    const context = {
      controller: 'ManageOsceController',
      action: 'update',
      paperSlug: params.paperSlug,
    }

    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)

    if (await bouncer.with(PastPaperPolicy).denies('update', paper)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        paperId: paper.id,
        message: 'Unauthorized update attempt',
      })
      return response.forbidden()
    }

    const payload = await request.validateUsing(updatePastPaperValidator)
    await paper
      .merge({
        ...payload,
        metadata: this.getMetadataUpdate(paper.metadata, auth),
      })
      .save()

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      message: 'OSCE paper updated successfully',
    })

    return response.redirect().back()
  }

  /**
   * Show OSCE paper details for management
   */
  async viewOscePaper({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageOsceController',
      action: 'viewOscePaper',
      conceptSlug: params.conceptSlug,
      paperSlug: params.paperSlug,
    }
    logger.info({ ...context, message: 'Fetching OSCE paper details' })

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .where('paper_type', PaperType.OSCE)
      .preload('concept')
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('osceParts')
      })
      .firstOrFail()

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      message: 'Found OSCE paper details',
    })

    return inertia.render('manage/osce/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
    })
  }

  /**
   * Add a new OSCE question
   */
  async addQuestion({ request, response, params, auth, session, logger }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)
    const data = await request.validateUsing(createOsceQuestionValidator)
    const slug = generateSlug()

    try {
      await db.transaction(async (trx) => {
        // Update paper metadata
        await paper
          .merge({
            metadata: this.getMetadataUpdate(paper.metadata, auth),
          })
          .save()

        // Handle question image upload if present
        let questionImageUrl = data.questionImagePath || null

        // Create question
        const [question] = await trx
          .insertQuery()
          .table('questions')
          .insert({
            user_id: auth.user!.id,
            past_paper_id: paper.id,
            slug,
            type: QuestionType.OSCE,
            question_text: data.questionText,
            question_image_path: questionImageUrl,
          })
          .returning('*')

        // Handle OSCE parts with images
        for (const part of data.parts) {
          await trx
            .insertQuery()
            .table('osce_parts')
            .insert({
              question_id: question.id,
              part_text: part.partText,
              expected_answer: part.expectedAnswer,
              marks: part.marks,
              image_path: part.imagePath || null,
            })
        }
      })

      session.flash('success', 'OSCE question added successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to create osce question', { error })
      throw error
    }
  }

  /**
   * Update an OSCE question
   */
  async updateQuestion({ params, request, response, auth, session, logger }: HttpContext) {
    const question = await Question.query()
      .where('slug', params.questionSlug)
      .preload('pastPaper')
      .preload('osceParts')
      .firstOrFail()

    if (question.type !== QuestionType.OSCE) {
      return response.badRequest('Question is not OSCE type')
    }

    const data = await request.validateUsing(updateOsceQuestionValidator)

    try {
      await db.transaction(async (trx) => {
        // Update paper metadata
        await question.pastPaper
          .merge({
            metadata: this.getMetadataUpdate(question.pastPaper.metadata, auth),
          })
          .useTransaction(trx)
          .save()

        // Update question
        await question
          .merge({
            questionText: data.questionText,
            questionImagePath: data.questionImagePath || null,
          })
          .useTransaction(trx)
          .save()

        // Delete existing parts
        await trx.from('osce_parts').where('question_id', question.id).delete()

        // Create new parts
        for (const part of data.parts) {
          await trx
            .insertQuery()
            .table('osce_parts')
            .insert({
              question_id: question.id,
              part_text: part.partText,
              expected_answer: part.expectedAnswer,
              marks: part.marks,
              image_path: part.imagePath || null,
            })
        }
      })

      logger.info('OSCE question updated successfully', {
        questionId: question.id,
        questionSlug: question.slug,
        userId: auth.user?.id,
      })

      session.flash('success', 'OSCE question updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to update OSCE question', {
        error,
        questionId: question.id,
        questionSlug: question.slug,
        userId: auth.user?.id,
      })
      throw error
    }
  }

  /**
   * Delete an OSCE question
   */
  async deleteQuestion({ params, response, auth, session, logger }: HttpContext) {
    const question = await Question.query()
      .where('slug', params.questionSlug)
      .preload('pastPaper')
      .firstOrFail()

    try {
      await db.transaction(async (trx) => {
        await question.pastPaper
          .merge({
            metadata: this.getMetadataUpdate(question.pastPaper.metadata, auth),
          })
          .useTransaction(trx)
          .save()

        await question.useTransaction(trx).delete()
      })

      session.flash('success', 'Question deleted successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to delete osce question', { error })
      throw error
    }
  }

  /**
   * Delete an OSCE paper
   */
  async destroy({ params, response, session, bouncer, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageOsceController',
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
      return response.forbidden('Cannot delete this OSCE paper')
    }

    await paper.delete()

    // Check if concept still has any OSCE papers
    const remainingOsces = await PastPaper.query()
      .where('concept_id', paper.conceptId)
      .where('paper_type', PaperType.OSCE)
      .first()

    if (!remainingOsces) {
      // Update concept has_osce flag
      const concept = await Concept.findOrFail(paper.conceptId)
      await concept.merge({ hasOsce: false }).save()
    }

    logger.info({
      ...context,
      userId: auth.user?.id,
      paperId: paper.id,
      conceptId: paper.conceptId,
      message: 'OSCE paper deleted successfully',
    })

    session.flash('success', 'OSCE paper deleted successfully')
    return response.redirect().toPath(`/manage/osce/${params.conceptSlug}`)
  }
}
