import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Today from '#models/today'
import { createTodayValidator, updateTodayValidator } from '#validators/today'
import { generateSlug } from '#utils/slug_generator'

interface IncomingChoiceData {
  id?: number
  choiceText: string
  isCorrect: boolean
  explanation?: string
}

import db from '@adonisjs/lucid/services/db'
import TodayDto from '#dtos/today'
import Question from '#models/question'
import QuestionDto from '#dtos/question'
import { TodayStatus } from '#enums/today_status'
import { createMcqQuestionValidator } from '#validators/question'
import { QuestionType } from '#enums/question_types'
import { DateTime } from 'luxon'
import ArchiveOutdatedTodayJob from '#jobs/archive_outdated_today_job'
import QuestionManagementService from '#services/question_management_service'
import QuestionDeletionService from '#services/question_deletion_service'

@inject()
export default class ManageTodayController {
  constructor(private questionManagementService: QuestionManagementService) { }
  /**
   * Display a list of today items
   */
  async index({ inertia, logger, auth, bouncer }: HttpContext) {
    const context = { controller: 'ManageTodayController', action: 'index' }
    logger.info({ ...context, message: 'Fetching today items' })

    const todayItems = await Today.query()
      .where('user_id', auth.user!.id)
      .orderBy('scheduled_for', 'asc')
      .orderBy('created_at', 'desc')

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: todayItems.length,
      message: 'Retrieved today items',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('manage/today/index', {
      todayItems: TodayDto.fromArray(todayItems),
      canManage,
    })
  }

  /**
   * Display a specific today item
   */
  async show({ params, inertia, logger, auth, bouncer }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'show',
      todaySlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching today item' })

    const today = await Today.query()
      .where('slug', params.slug)
      .where('user_id', auth.user!.id)
      .preload('questions', (query) => {
        query.preload('choices')
        query.preload('concepts')
      })
      .firstOrFail()

    logger.info({
      ...context,
      userId: auth.user?.id,
      todayId: today.id,
      message: 'Found today item with questions',
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('manage/today/show', {
      today: new TodayDto(today),
      questions: today.questions ? QuestionDto.fromArray(today.questions) : [],
      canManage,
    })
  }

  /**
   * Create a new today item
   */
  async store({ request, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'store',
    }
    logger.info({ ...context, message: 'Creating new today item' })

    const data = await request.validateUsing(createTodayValidator)
    const status = data.status || TodayStatus.SCHEDULED

    await db.transaction(async (trx) => {
      // If creating an active today, archive any existing active days
      if (status === TodayStatus.ACTIVE) {
        await Today.query({ client: trx })
          .where('status', TodayStatus.ACTIVE)
          .update({ status: TodayStatus.ARCHIVED })

        logger.info({
          ...context,
          message: 'Archived previously active Today items',
        })
      }

      // Create the new Today item
      const today = await Today.create({
        ...data,
        userId: auth.user!.id,
        slug: generateSlug(),
        status: status,
      })

      logger.info({
        ...context,
        userId: auth.user!.id,
        todayId: today.id,
        todaySlug: today.slug,
        message: 'Today item created successfully',
      })

      session.flash('success', 'Today item created successfully')
      return response.redirect().toPath(`/ manage / today / ${ today.slug } `)
    })
  }

  /**
   * Update a today item
   */
  async update({ params, request, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'update',
      todaySlug: params.slug,
    }
    logger.info({ ...context, message: 'Updating today item' })

    const today = await Today.query()
      .where('slug', params.slug)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    const data = await request.validateUsing(updateTodayValidator)

    // Start a transaction for atomic updates
    await db.transaction(async (trx) => {
      // If setting this today to active, archive any existing active days
      if (data.status === TodayStatus.ACTIVE) {
        await Today.query({ client: trx })
          .where('status', TodayStatus.ACTIVE)
          .where('id', '!=', today.id)
          .update({ status: TodayStatus.ARCHIVED })

        logger.info({
          ...context,
          message: 'Archived previously active Today items',
        })
      }
      // Update basic properties
      await today
        .merge({
          title: data.title,
          scheduledFor: data.scheduledFor,
          status: data.status,
        })
        .useTransaction(trx)
        .save()
    })

    logger.info({
      ...context,
      userId: auth.user?.id,
      todayId: today.id,
      message: 'Today item updated successfully',
    })

    session.flash('success', 'Today item updated successfully')
    return response.redirect().back()
  }

  /**
   * Delete a today item
   */
  async destroy({ params, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'destroy',
      todaySlug: params.slug,
    }
    logger.info({ ...context, message: 'Deleting today item' })

    const today = await Today.query()
      .where('slug', params.slug)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    await db.transaction(async (trx) => {
      // Update any associated questions to remove the today_id reference
      await Question.query({ client: trx }).where('today_id', today.id).update({ today_id: null })

      // Delete the today item
      await today.useTransaction(trx).delete()
    })

    logger.info({
      ...context,
      userId: auth.user?.id,
      todayId: today.id,
      message: 'Today item deleted successfully',
    })

    session.flash('success', 'Today item deleted successfully')
    return response.redirect().toPath('/today')
  }

  /**
   * Add a new MCQ question to a today item
   */
  async addQuestion({ params, request, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'addMcqQuestion',
      todaySlug: params.slug,
    }
    logger.info({ ...context, message: 'Adding MCQ to today item' })

    const today = await Today.query()
      .where('slug', params.slug)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    const data = await request.validateUsing(createMcqQuestionValidator)

    try {
      await this.questionManagementService.createMcqForToday(
        today,
        {
          questionText: data.questionText,
          questionImagePath: data.questionImagePath,
          choices: data.choices.map((c) => ({
            choiceText: c.choiceText,
            isCorrect: c.isCorrect,
            explanation: c.explanation,
          })),
        },
        auth.user!
      )

      logger.info({
        ...context,
        userId: auth.user?.id,
        todayId: today.id,
        message: 'MCQ added to today item successfully',
      })

      session.flash('success', 'MCQ added successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to create mcq question', { error })
      throw error
    }
  }

  /**
   * Edit a question in a today item
   */
  async editQuestion({ params, request, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'editQuestion',
      todaySlug: params.slug,
      questionSlug: params.questionSlug,
    }
    logger.info({ ...context, message: 'Editing question in today item' })

    const today = await Today.query()
      .where('slug', params.slug)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    const question = await Question.query()
      .where('slug', params.questionSlug)
      .where('today_id', today.id)
      .preload('choices') // Preload choices for MCQ questions
      .firstOrFail()



    try {
      if (question.type === QuestionType.MCQ) {
        const { questionText, choices } = request.only(['questionText', 'choices'])

        await this.questionManagementService.updateMcq(
          question,
          {
            questionText,
            choices: choices && Array.isArray(choices)
              ? choices.map((c: IncomingChoiceData) => ({
                id: c.id,
                choiceText: c.choiceText,
                isCorrect: c.isCorrect,
                explanation: c.explanation
              }))
              : undefined
          },
          auth.user!
        )
      } else {
        // Fallback for non-MCQ (just text update)
        const { questionText } = request.only(['questionText'])
        await question.merge({ questionText }).save()
      }

      logger.info({
        ...context,
        userId: auth.user?.id,
        todayId: today.id,
        questionId: question.id,
        message: 'Question edited successfully',
      })

      session.flash('success', 'Question updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to update question', { error, questionId: question.id })
      throw error
    }
  }

  /**
   * Delete a question from a today item
   */
  async removeQuestion({ params, response, auth, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'deleteQuestion',
      todaySlug: params.slug,
      questionId: params.questionId, // Changed from questionSlug
    }
    logger.info({ ...context, message: 'Deleting question from today item' })

    try {
      const today = await Today.query()
        .where('slug', params.slug)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      // Validate question belongs to this today item
      const question = await Question.query()
        .where('id', params.questionId)
        .where('today_id', today.id)
        .firstOrFail()

      // Use deletion service
      await QuestionDeletionService.delete(question.id)

      logger.info({
        ...context,
        userId: auth.user?.id,
        questionId: question.id,
        message: 'Question deleted successfully',
      })

      session.flash('success', 'Question deleted successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to delete question', { error })
      throw error
    }
  }

  /**
   * Archive outdated Today items manually
   */
  async archiveOutdated({ response, logger, bouncer }: HttpContext) {
    // Ensure only admins can access this endpoint
    await bouncer.authorize('canManage')

    try {
      const today = DateTime.now().toISODate()

      logger.info({
        controller: 'ManageTodayController',
        action: 'archiveOutdated',
        message: 'Manually triggering archiving of outdated Today items',
        currentDate: today,
      })

      // Run the job immediately
      await ArchiveOutdatedTodayJob.dispatch({ forceRun: true })

      return response.json({
        success: true,
        message: 'Archiving job dispatched successfully',
      })
    } catch (error) {
      logger.error('Failed to dispatch archiving job', { error })
      return response.status(500).json({
        success: false,
        message: 'Failed to dispatch archiving job',
      })
    }
  }

  /**
   * Add concepts to a question
   */
  async addConceptsToQuestion({ params, request, response, auth, logger }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'addConceptsToQuestion',
      todaySlug: params.slug,
      questionId: params.questionId,
    }
    logger.info({ ...context, message: 'Adding concepts to question' })

    try {
      // Validate question belongs to this today item
      const today = await Today.query()
        .where('slug', params.slug)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      const question = await Question.query()
        .where('id', params.questionId)
        .where('today_id', today.id)
        .firstOrFail()

      // Get concept IDs from request
      const { conceptIds } = request.only(['conceptIds'])

      await db.transaction(async (trx) => {
        // Clear existing question topics if any
        await trx.from('question_topics').where('question_id', question.id).delete()

        // Insert new relationships if any concepts were provided
        if (Array.isArray(conceptIds) && conceptIds.length > 0) {
          await trx
            .insertQuery()
            .table('question_topics')
            .multiInsert(
              conceptIds.map((conceptId) => ({
                question_id: question.id,
                topic_id: conceptId,
              }))
            )
        }
      })

      logger.info({
        ...context,
        userId: auth.user?.id,
        conceptCount: Array.isArray(conceptIds) ? conceptIds.length : 0,
        message: 'Successfully added concepts to question',
      })

      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to add concepts to question', { error })
      throw error
    }
  }

  /**
   * Remove a concept from a question
   */
  async removeConceptFromQuestion({ params, response, auth, logger }: HttpContext) {
    const context = {
      controller: 'ManageTodayController',
      action: 'removeConceptFromQuestion',
      todaySlug: params.slug,
      questionId: params.questionId,
      conceptId: params.conceptId,
    }
    logger.info({ ...context, message: 'Removing concept from question' })

    try {
      // Validate question belongs to this today item
      const today = await Today.query()
        .where('slug', params.slug)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      const question = await Question.query()
        .where('id', params.questionId)
        .where('today_id', today.id)
        .firstOrFail()

      // Delete the specific relationship
      await db
        .from('question_topics')
        .where('question_id', question.id)
        .where('topic_id', params.conceptId)
        .delete()

      logger.info({
        ...context,
        userId: auth.user?.id,
        message: 'Successfully removed concept from question',
      })

      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to remove concept from question', { error })
      throw error
    }
  }
}
