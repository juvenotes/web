import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import QuestionFeedback from '#models/question_feedback'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import QuestionDto from '#dtos/question'
import { createPastPaperValidator, updatePastPaperValidator } from '#validators/past_paper'
import { generateSlug } from '#utils/slug_generator'
import PastPaperPolicy from '#policies/paper_policy'
import { MCQParser, MCQParserError } from '#services/mcq_parser_service'
import db from '@adonisjs/lucid/services/db'
import Question from '#models/question'
import { QuestionType } from '#enums/question_types'
import { promises as fs } from 'node:fs'
import {
  createMcqQuestionValidator,
  createSaqQuestionValidator,
  updateMcqQuestionValidator,
  updateSaqQuestionValidator,
} from '#validators/question'
import { PaperType } from '#enums/exam_type'
import QuestionFeedbackDto from '#dtos/question_feedback'

export default class ManagePastPapersController {
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
   * Show root level concepts with their papers
   */
  async index({ inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManagePastPapersController',
      action: 'index',
    }
    logger.info({ ...context, message: 'Fetching root concepts with papers' })

    const concepts = await Concept.query()
      .where('level', 0)
      .select(['id', 'title', 'slug', 'training_level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .whereIn('paper_type', [PaperType.MCQ, PaperType.SAQ, PaperType.MIXED])
          .orderBy('year', 'desc')
      })

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      message: 'found root concepts with papers',
    })

    return inertia.render('manage/papers/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show concept details with its papers
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManagePastPapersController',
      action: 'show',
      conceptSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching concept with papers' })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug', 'study_level'])
          .whereIn('paper_type', [PaperType.MCQ, PaperType.SAQ, PaperType.MIXED])
          .orderBy('year', 'desc')
          .preload('questions', (questionsQuery) => {
            questionsQuery.select(['id', 'past_paper_id'])
          })
      })
      .firstOrFail()

    logger.info({
      ...context,
      userId: auth.user?.id,
      conceptId: concept.id,
      conceptTitle: concept.title,
      papersCount: concept.pastPapers?.length ?? 0,
      message: 'found concept with papers',
    })

    return inertia.render('manage/papers/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
      questions: concept.pastPapers?.flatMap((paper) => paper.questions) ?? [],
    })
  }

  /**
   * Show a specific paper for management
   */

  async viewPaper({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManagePastPapersController',
      action: 'viewPaper',
      paperSlug: params.paperSlug,
      userId: auth.user?.id,
    }
    logger.info({ ...context, message: 'fetching paper details' })
    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .preload('concept')
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('choices').preload('parts')
      })
      .firstOrFail()

    // Get feedback counts for each question
    const questionIds = paper.questions.map((q) => q.id)
    const feedbackCounts = await db
      .from('question_feedbacks')
      .whereIn('question_id', questionIds)
      .where('is_resolved', false)
      .count('* as count')
      .groupBy('question_id')
      .select('question_id')

    // Get actual feedback for each question
    const questionFeedback = await QuestionFeedback.query()
      .whereIn('questionId', questionIds)
      .preload('user')
      .orderBy('createdAt', 'desc')

    // Create maps for counts and feedback items with proper type definitions
    const feedbackCountMap: Record<number, number> = {}
    feedbackCounts.forEach((item) => {
      feedbackCountMap[item.question_id] = Number(item.count)
    })

    // Organize feedback by question with proper type definition
    const questionFeedbackMap: Record<number, QuestionFeedbackDto[]> = {}
    questionFeedback.forEach((item) => {
      if (!questionFeedbackMap[item.questionId]) {
        questionFeedbackMap[item.questionId] = []
      }
      questionFeedbackMap[item.questionId].push(new QuestionFeedbackDto(item))
    })

    return inertia.render('manage/papers/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
      feedbackCountMap,
      questionFeedbackMap,
    })
  }

  // async viewPaper({ params, inertia, logger, auth }: HttpContext) {
  //   const context = {
  //     controller: 'ManagePastPapersController',
  //     action: 'viewPaper',
  //     paperSlug: params.paperSlug,
  //     userId: auth.user?.id,
  //   }
  //   logger.info({ ...context, message: 'fetching paper details' })

  //   const paper = await PastPaper.query()
  //     .where('slug', params.paperSlug)
  //     .whereIn('paper_type', [PaperType.MCQ, PaperType.SAQ, PaperType.MIXED])
  //     .preload('concept')
  //     .preload('questions', (query) => {
  //       query.orderBy('id', 'asc').preload('choices').preload('parts')
  //     })
  //     .firstOrFail()

  //   return inertia.render('manage/papers/view', {
  //     paper: new PastPaperDto(paper),
  //     concept: new ConceptDto(paper.concept),
  //     questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
  //   })
  // }

  /**
   * Store a new paper
   */
  async store({ request, response, auth, logger, session }: HttpContext) {
    const data = await request.validateUsing(createPastPaperValidator)

    const concept = await Concept.findOrFail(data.conceptId)
    const paper = await PastPaper.create({
      ...data,
      userId: auth.user!.id,
      slug: generateSlug(),
      metadata: {
        lastEditedBy: {
          fullName: auth.user!.fullName!,
          timestamp: new Date(),
        },
      },
    })

    logger.info('paper created successfully', {
      userId: auth.user!.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      action: 'create_paper',
    })

    session.flash('success', 'Paper created successfully')
    return response.redirect().toPath(`/manage/papers/${concept.slug}/${paper.slug}`)
  }

  async update({ params, request, response, bouncer, session }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)

    if (await bouncer.with(PastPaperPolicy).denies('update', paper)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(updatePastPaperValidator)
    await paper.merge(payload).save()

    session.flash('success', 'Paper updated successfully')
    return response.redirect().back()
  }

  async addMcqQuestion({ request, response, params, auth, session, logger }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)
    const data = await request.validateUsing(createMcqQuestionValidator)
    const slug = generateSlug()

    try {
      await db.transaction(async (trx) => {
        // Update paper metadata
        await paper
          .merge({
            metadata: this.getMetadataUpdate(paper.metadata, auth),
          })
          .save()

        // Use raw query like seeder
        const [question] = await trx
          .insertQuery()
          .table('questions')
          .insert({
            user_id: auth.user!.id,
            past_paper_id: paper.id,
            slug,
            type: QuestionType.MCQ,
            question_text: data.questionText,
          })
          .returning('*')

        // Insert choices
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
      })

      session.flash('success', 'MCQ added successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to create mcq question', { error })
      throw error
    }
  }

  async addSaqQuestion({ request, response, params, auth, session, logger }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)
    const data = await request.validateUsing(createSaqQuestionValidator)
    const slug = generateSlug()

    try {
      await db.transaction(async (trx) => {
        // Update paper metadata
        await paper
          .merge({
            metadata: this.getMetadataUpdate(paper.metadata, auth),
          })
          .save()

        // Use raw query like seeder
        const [question] = await trx
          .insertQuery()
          .table('questions')
          .insert({
            user_id: auth.user!.id,
            past_paper_id: paper.id,
            slug,
            type: QuestionType.SAQ,
            question_text: data.questionText,
          })
          .returning('*')

        // Insert parts
        await trx
          .insertQuery()
          .table('saq_parts')
          .insert(
            data.parts.map((part) => ({
              question_id: question.id,
              part_text: part.partText,
              expected_answer: part.expectedAnswer,
              marks: part.marks,
            }))
          )
      })

      session.flash('success', 'SAQ added successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to create saq question', { error })
      throw error
    }
  }

  async uploadMcqs({ request, response, params, auth, session, logger }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)
    const file = request.file('file')
    if (!file) return response.badRequest('No file uploaded')

    try {
      const content = await fs.readFile(file.tmpPath!, 'utf-8')
      const parsedQuestions = MCQParser.parse(content)

      logger.info('questions parsed', {
        count: parsedQuestions.length,
        first: parsedQuestions[0]?.stem,
      })

      await db.transaction(async (trx) => {
        await paper
          .merge({
            metadata: this.getMetadataUpdate(paper.metadata, auth),
          })
          .save()

        for (const [index, parsedQuestion] of parsedQuestions.entries()) {
          logger.info(`processing question ${index + 1}/${parsedQuestions.length}`)

          const [question] = await trx
            .insertQuery()
            .table('questions')
            .insert({
              user_id: auth.user!.id,
              past_paper_id: paper.id,
              slug: generateSlug(),
              type: QuestionType.MCQ,
              question_text: parsedQuestion.stem,
            })
            .returning('*')

          const correctIndex = parsedQuestion.answer.charCodeAt(0) - 65
          const choices = parsedQuestion.choices.map((choiceText, idx) => ({
            question_id: question.id,
            choice_text: choiceText,
            is_correct: idx === correctIndex,
            explanation: idx === correctIndex ? parsedQuestion.explanation : null,
          }))

          await trx.insertQuery().table('mcq_choices').insert(choices)
        }
      })

      session.flash('success', `Successfully uploaded ${parsedQuestions.length} questions`)
      return response.redirect().back()
    } catch (error) {
      if (error instanceof MCQParserError) {
        logger.error('mcq parsing failed', { error })
        return response.badRequest(`Parse error: ${error.message}`)
      }
      logger.error('failed to upload mcqs', { error })
      throw error
    }
  }

  async updateMcq({ params, request, response, auth, session, logger }: HttpContext) {
    try {
      // Load question with pastPaper relationship
      const question = await Question.query()
        .where('slug', params.questionSlug)
        .preload('pastPaper')
        .firstOrFail()

      if (!question.isMcq) {
        return response.badRequest('Question is not MCQ type')
      }

      const data = await request.validateUsing(updateMcqQuestionValidator)

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
          })
          .useTransaction(trx)
          .save()

        // Update choices
        await trx.from('mcq_choices').where('question_id', question.id).delete()

        await trx.table('mcq_choices').insert(
          data.choices.map((choice) => ({
            question_id: question.id,
            choice_text: choice.choiceText,
            is_correct: choice.isCorrect,
            explanation: choice.explanation ?? null,
          }))
        )
      })

      session.flash('success', 'MCQ updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to update mcq', { error })
      throw error
    }
  }

  async updateSaq({ params, request, response, auth, session, logger }: HttpContext) {
    const question = await Question.query()
      .where('slug', params.questionSlug)
      .preload('pastPaper')
      .firstOrFail()

    if (!question.isSaq) {
      return response.badRequest('Question is not SAQ type')
    }

    try {
      const data = await request.validateUsing(updateSaqQuestionValidator)

      await db.transaction(async (trx) => {
        await question.pastPaper
          .merge({
            metadata: this.getMetadataUpdate(question.pastPaper.metadata, auth),
          })
          .useTransaction(trx)
          .save()

        await question
          .merge({
            questionText: data.questionText,
          })
          .useTransaction(trx)
          .save()

        await trx.from('saq_parts').where('question_id', question.id).delete()
        await trx.table('saq_parts').insert(
          data.parts.map((part: { partText: string; expectedAnswer: string; marks: number }) => ({
            question_id: question.id,
            part_text: part.partText,
            expected_answer: part.expectedAnswer,
            marks: part.marks,
          }))
        )
      })

      session.flash('success', 'SAQ updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to update saq', { error })
      throw error
    }
  }

  async deleteQuestion({ params, response, auth, session, logger }: HttpContext) {
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

        // Delete the question
        await question.useTransaction(trx).delete()
      })

      session.flash('success', 'Question deleted successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to delete question', { error })
      throw error
    }
  }

  /**
   * Delete a paper
   */
  async destroy({ params, response, session, bouncer, logger, auth }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)

    logger.info('attempting to delete paper', {
      userId: auth?.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      action: 'delete_paper',
    })

    if (await bouncer.with(PastPaperPolicy).denies('delete', paper)) {
      logger.warn('unauthorized paper deletion attempt', {
        userId: auth?.user?.id,
        paperId: paper.id,
        paperSlug: paper.slug,
        action: 'delete_paper',
      })
      return response.forbidden('Cannot delete this paper')
    }

    await paper.delete()

    logger.info('paper deleted successfully', {
      userId: auth?.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      action: 'delete_paper',
    })

    session.flash('success', 'Paper deleted. Refresh page if necessary')
    return response.redirect().toPath(`/manage/papers/${params.conceptSlug}`)
  }
}
