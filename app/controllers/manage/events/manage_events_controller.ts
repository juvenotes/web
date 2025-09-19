import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'
import EventQuizDto from '#dtos/event_quiz'
import QuestionDto from '#dtos/question'
import EventQuiz from '#models/event_quiz'
import Question from '#models/question'
import UserQuizStatDto from '#dtos/user_quiz_stat'
import { createEventValidator, updateEventValidator } from '#validators/event'
import { createEventQuizValidator, updateEventQuizValidator } from '#validators/event_quiz'
import { createMcqQuestionValidator, updateMcqQuestionValidator } from '#validators/question'
import string from '@adonisjs/core/helpers/string'
import { generateSlug } from '#utils/slug_generator'
import { CloudinaryService } from '#services/cloudinary_service'
import { MCQParser, MCQParserError } from '#services/mcq_parser_service'
import { QuizLeaderboardService } from '#services/quiz_leaderboard_service'
import { QuestionType } from '#enums/question_types'
import fs from 'node:fs/promises'
import EventPolicy from '#policies/event_policy'
import db from '@adonisjs/lucid/services/db'

export default class ManageEventsController {
  /**
   * Publish an event (set status to published)
   */
  async publishEvent({ params, response, auth, bouncer, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'publishEvent',
      eventSlug: params.slug,
      userId: auth.user?.id,
    }
    logger.info({ ...context, message: 'Publishing event' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized update attempt',
      })
      return response.forbidden()
    }

    event.status = 'published'
    await event.save()

    logger.info({ ...context, message: 'Event published successfully' })
    session.flash('success', 'Event published successfully')
    return response.redirect().back()
  }

  /**
   * Show event creation form
   */
  async create({ inertia, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'create',
    }
    logger.info({ ...context, message: 'Showing event creation form' })

    if (await bouncer.with(EventPolicy).denies('create')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized create attempt' })
      return inertia.render('errors/forbidden')
    }

    return inertia.render('manage/events/create')
  }

  /**
   * Store a new event
   */
  async store({ request, auth, response, session, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'store',
    }
    logger.info({ ...context, message: 'Creating new event' })

    if (await bouncer.with(EventPolicy).denies('create')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized create attempt' })
      return response.forbidden()
    }

    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createEventValidator)

    try {
      await db.transaction(async (trx) => {
        // Generate slug
        const slug = string.slug(data.title)

        // Check if slug already exists
        const existingEvent = await Event.findBy('slug', slug)
        if (existingEvent) {
          session.flash('error', 'An event with this title already exists')
          logger.warn({ ...context, userId: user.id, slug, message: 'Duplicate event slug' })
          return response.redirect().back()
        }

        // Handle image upload if provided
        let imageUrl = data.imageUrl || null
        const imageFile = request.file('image')
        if (imageFile && imageFile.isValid) {
          try {
            imageUrl = await CloudinaryService.uploadImage(imageFile.tmpPath!, {
              folder: 'events',
              subFolder: 'covers',
            })
          } catch (error) {
            logger.error({ ...context, userId: user.id, error, message: 'Image upload failed' })
            session.flash('error', 'Failed to upload image')
            return response.redirect().back()
          }
        }

        // Ensure content is a JSON string if it's an object
        const contentJson =
          typeof data.content === 'object' && data.content !== null
            ? JSON.stringify(data.content)
            : data.content

        const event = await Event.create(
          {
            userId: user.id,
            title: data.title,
            slug,
            description: data.description,
            content: contentJson,
            eventType: data.eventType,
            startDate: data.startDate,
            endDate: data.endDate,
            registrationDeadline: data.registrationDeadline,
            venue: data.venue,
            address: data.address,
            onlineLink: data.onlineLink,
            isOnline: data.isOnline || false,
            isFree: data.isFree !== undefined ? data.isFree : true,
            price: data.price,
            currency: data.currency || 'KES',
            maxParticipants: data.maxParticipants,
            imageUrl,
            status: data.status || 'draft',
          },
          { client: trx }
        )

        logger.info({
          ...context,
          userId: user.id,
          eventId: event.id,
          slug: event.slug,
          message: 'Event created successfully',
        })
        session.flash('success', 'Event created successfully')
        return response.redirect().back()
      })
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Event creation failed',
      })
      throw error
    }
  }

  /**
   * Show a single event for management
   */
  async show({ params, inertia, auth, bouncer, logger, response }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'show',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching event for management' })

    if (await bouncer.with(EventPolicy).denies('view')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized view attempt' })
      return response.forbidden()
    }

    const event = await Event.query()
      .where('slug', params.slug)
      .preload('user')
      .preload('quizzes', (query) => {
        query.preload('questions', (q) => {
          q.preload('choices')
        })
      })
      .firstOrFail()

    const eventDto = new EventDto(event)
    const quizDtos = event.quizzes.map((quiz) => new EventQuizDto(quiz))

    logger.info({
      ...context,
      userId: auth.user?.id,
      eventId: event.id,
      quizzesCount: quizDtos.length,
      message: 'Event fetched for management',
    })

    return inertia.render('manage/events/show', {
      event: eventDto,
      quizzes: quizDtos,
    })
  }

  /**
   * Show edit form for an event
   */
  async edit({ params, inertia, auth, bouncer, logger, response }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'edit',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Showing event edit form' })

    const event = await Event.query().where('slug', params.slug).preload('user').firstOrFail()

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized edit attempt',
      })
      return response.forbidden()
    }

    const eventDto = new EventDto(event)

    return inertia.render('manage/events/edit', {
      event: eventDto,
    })
  }

  /**
   * Update an event
   */
  async update({ params, request, response, session, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'update',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Updating event' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized update attempt',
      })
      return response.forbidden()
    }

    const data = await request.validateUsing(updateEventValidator)

    try {
      await db.transaction(async (trx) => {
        // If title is being updated, generate new slug
        if (data.title && data.title !== event.title) {
          const newSlug = string.slug(data.title)
          const existingEvent = await Event.query()
            .where('slug', newSlug)
            .where('id', '!=', event.id)
            .first()
          if (existingEvent) {
            session.flash('error', 'An event with this title already exists')
            logger.warn({
              ...context,
              userId: auth.user?.id,
              eventId: event.id,
              newSlug,
              message: 'Duplicate event slug on update',
            })
            return response.redirect().back()
          }
          event.slug = newSlug
        }

        // Handle image upload if provided
        let imageUrl = data.imageUrl || event.imageUrl
        const imageFile = request.file('image')
        if (imageFile && imageFile.isValid) {
          try {
            imageUrl = await CloudinaryService.uploadImage(imageFile.tmpPath!, {
              folder: 'events',
              subFolder: 'covers',
            })
          } catch (error) {
            logger.error({
              ...context,
              userId: auth.user?.id,
              eventId: event.id,
              error,
              message: 'Image upload failed',
            })
            session.flash('error', 'Failed to upload image')
            return response.redirect().back()
          }
        }

        // Merge event updates (no metadata)
        event.useTransaction(trx)
        await event
          .merge({
            title: data.title,
            description: data.description,
            content: data.content,
            eventType: data.eventType,
            status: data.status,
            startDate: data.startDate,
            endDate: data.endDate,
            registrationDeadline: data.registrationDeadline,
            venue: data.venue,
            address: data.address,
            onlineLink: data.onlineLink,
            isOnline: data.isOnline,
            isFree: data.isFree,
            price: data.price,
            currency: data.currency,
            maxParticipants: data.maxParticipants,
            imageUrl,
          })
          .save()

        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          message: 'Event updated successfully',
        })
        session.flash('success', 'Event updated successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        error,
        message: 'Event update failed',
      })
      throw error
    }
  }

  /**
   * Delete an event (soft delete)
   */
  async destroy({ params, response, session, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'destroy',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Deleting event' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('delete', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized delete attempt',
      })
      return response.forbidden()
    }

    try {
      await db.transaction(async (trx) => {
        event.useTransaction(trx)
        await event.delete()
        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          message: 'Event deleted successfully',
        })
        session.flash('success', 'Event deleted successfully')
        return response.redirect().toRoute('manage.events.index')
      })
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        error,
        message: 'Event deletion failed',
      })
      throw error
    }
  }

  /**
   * Show quiz creation form
   */
  async createQuiz({ params, inertia, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'createQuiz',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Showing quiz creation form' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized quiz create form access',
      })
      return inertia.render('errors/forbidden')
    }

    const eventDto = new EventDto(event)

    return inertia.render('manage/events/create-quiz', {
      event: eventDto,
    })
  }

  /**
   * Store a new quiz for an event
   */
  async storeQuiz({ params, request, response, session, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'storeQuiz',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Creating event quiz' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized quiz create attempt',
      })
      return response.forbidden()
    }

    const data = await request.validateUsing(createEventQuizValidator)

    try {
      await db.transaction(async (trx) => {
        const quiz = await EventQuiz.create(
          {
            userId: auth.user!.id,
            eventId: event.id,
            title: data.title,
            slug: generateSlug(),
            description: data.description || null,
            status: data.status || 'draft',
          },
          { client: trx }
        )
        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          quizId: quiz.id,
          message: 'Event quiz created successfully',
        })
        session.flash('success', 'Quiz created successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        error,
        message: 'Quiz creation failed',
      })
      throw error
    }
  }

  /**
   * Show a specific quiz for management
   */
  async viewQuiz({ params, inertia, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'viewQuiz',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Fetching quiz for management' })

    if (await bouncer.with(EventPolicy).denies('view')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized view attempt' })
      return inertia.render('errors/forbidden')
    }

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.query()
      .where('id', params.quizId)
      .where('eventId', event.id)
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('choices')
      })
      .firstOrFail()

    const eventDto = new EventDto(event)
    const quizDto = new EventQuizDto(quiz)
    const questionsDto = quiz.questions ? QuestionDto.fromArray(quiz.questions) : []

    logger.info({
      ...context,
      userId: auth.user?.id,
      eventId: event.id,
      quizId: quiz.id,
      questionsCount: questionsDto.length,
      message: 'Quiz fetched for management',
    })

    return inertia.render('manage/events/view', {
      event: eventDto,
      quiz: quizDto,
      questions: questionsDto,
    })
  }

  /**
   * Show quiz edit form
   */
  async editQuiz({ params, inertia, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'editQuiz',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Showing quiz edit form' })

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.query()
      .where('id', params.quizId)
      .preload('questions', (query) => {
        query.preload('choices')
      })
      .firstOrFail()

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized quiz edit form access',
      })
      return inertia.render('errors/forbidden')
    }

    const eventDto = new EventDto(event)
    const quizDto = new EventQuizDto(quiz)

    return inertia.render('manage/events/edit-quiz', {
      event: eventDto,
      quiz: quizDto,
    })
  }

  /**
   * Update a quiz
   */
  async updateQuiz({ params, request, response, session, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'updateQuiz',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Updating event quiz' })

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.findOrFail(params.quizId)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized quiz update attempt',
      })
      return response.forbidden()
    }

    const data = await request.validateUsing(updateEventQuizValidator)

    try {
      await db.transaction(async (trx) => {
        quiz.useTransaction(trx)
        await quiz
          .merge({
            title: data.title || quiz.title,
            description: data.description !== undefined ? data.description : quiz.description,
            status: data.status || quiz.status,
          })
          .save()
        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          quizId: quiz.id,
          message: 'Event quiz updated successfully',
        })
        session.flash('success', 'Quiz updated successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        quizId: quiz.id,
        error,
        message: 'Quiz update failed',
      })
      throw error
    }
  }

  /**
   * Delete a quiz
   */
  async destroyQuiz({ params, response, session, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'destroyQuiz',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Deleting event quiz' })

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.findOrFail(params.quizId)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized quiz delete attempt',
      })
      return response.forbidden()
    }

    try {
      await db.transaction(async (trx) => {
        quiz.useTransaction(trx)
        await quiz.delete()
        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          quizId: quiz.id,
          message: 'Event quiz deleted successfully',
        })
        session.flash('success', 'Quiz deleted successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        quizId: quiz.id,
        error,
        message: 'Quiz deletion failed',
      })
      throw error
    }
  }

  /**
   * Upload quiz questions from file
   */
  async uploadQuiz({ request, response, params, session, logger, auth, bouncer }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'uploadQuiz',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Uploading event quiz from file' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized quiz upload attempt',
      })
      return response.forbidden()
    }

    const file = request.file('file')
    const title = request.input('title')
    const description = request.input('description')

    if (!file) return response.badRequest('No file uploaded')
    if (!title) return response.badRequest('Quiz title is required')

    try {
      await db.transaction(async (trx) => {
        const content = await fs.readFile(file.tmpPath!, 'utf-8')
        let parsedQuestions
        try {
          parsedQuestions = MCQParser.parse(content)
        } catch (error) {
          logger.error('quiz parsing failed', { ...context, error })
          if (error instanceof MCQParserError) throw error
          throw new Error('Failed to parse quiz file')
        }

        logger.info('quiz questions parsed', {
          ...context,
          count: parsedQuestions.length,
          eventId: event.id,
          title,
        })

        // Create the quiz first
        const quiz = await EventQuiz.create(
          {
            userId: auth.user!.id,
            eventId: event.id,
            title,
            slug: generateSlug(),
            description: description || null,
            status: 'draft', // Default to draft for uploaded quizzes
          },
          { client: trx }
        )

        // Create questions for the quiz
        for (const [index, parsedQuestion] of parsedQuestions.entries()) {
          logger.info(`processing question ${index + 1}/${parsedQuestions.length}`)

          const [question] = await trx
            .insertQuery()
            .table('questions')
            .insert({
              user_id: auth.user!.id,
              event_quiz_id: quiz.id,
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

        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          quizId: quiz.id,
          questionsCount: parsedQuestions.length,
          message: 'Quiz uploaded successfully',
        })
        session.flash(
          'success',
          `Successfully uploaded quiz with ${parsedQuestions.length} questions`
        )
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      if (error instanceof MCQParserError) {
        logger.error('quiz parsing failed', { ...context, error })
        return response.badRequest(`Parse error: ${error.message}`)
      }
      logger.error('failed to upload quiz', { ...context, error })
      throw error
    }
  }

  /**
   * Add a question to an existing quiz
   */
  async addQuizQuestion({
    params,
    request,
    response,
    session,
    auth,
    bouncer,
    logger,
  }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'addQuizQuestion',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Adding question to quiz' })

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.query()
      .where('id', params.quizId)
      .where('eventId', event.id)
      .firstOrFail()

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized access' })
      return response.forbidden()
    }

    const data = await request.validateUsing(createMcqQuestionValidator)
    const slug = generateSlug()

    try {
      await db.transaction(async (trx) => {
        const [question] = await trx
          .insertQuery()
          .table('questions')
          .insert({
            user_id: auth.user!.id,
            event_quiz_id: quiz.id,
            slug,
            type: QuestionType.MCQ,
            question_text: data.questionText,
            question_image_path: data.questionImagePath || null,
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
      })

      session.flash('success', 'Question added successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to create quiz question', { ...context, error })
      throw error
    }
  }

  /**
   * Upload multiple questions to an existing quiz
   */
  async uploadQuizQuestions({
    params,
    request,
    response,
    session,
    auth,
    bouncer,
    logger,
  }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'uploadQuizQuestions',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Uploading questions to quiz' })

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.query()
      .where('id', params.quizId)
      .where('eventId', event.id)
      .firstOrFail()

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized access' })
      return response.forbidden()
    }

    const file = request.file('file')
    if (!file) return response.badRequest('No file uploaded')

    try {
      const content = await fs.readFile(file.tmpPath!, 'utf-8')
      const parsedQuestions = MCQParser.parse(content)

      logger.info('questions parsed', {
        ...context,
        count: parsedQuestions.length,
        first: parsedQuestions[0]?.stem,
      })

      await db.transaction(async (trx) => {
        for (const parsedQuestion of parsedQuestions) {
          const [question] = await trx
            .insertQuery()
            .table('questions')
            .insert({
              user_id: auth.user!.id,
              event_quiz_id: quiz.id,
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
        logger.error('question parsing failed', { ...context, error })
        return response.badRequest(`Parse error: ${error.message}`)
      }
      logger.error('failed to upload questions', { ...context, error })
      throw error
    }
  }

  /**
   * Update a quiz question
   */
  async updateQuizQuestion({ params, request, response, session, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'updateQuizQuestion',
      eventSlug: params.slug,
      quizId: params.quizId,
      questionSlug: params.questionSlug,
    }
    logger.info({ ...context, message: 'Updating quiz question' })

    const event = await Event.findByOrFail('slug', params.slug)
    if (await bouncer.with(EventPolicy).denies('update', event)) {
      return response.forbidden()
    }

    const question = await Question.query()
      .where('slug', params.questionSlug)
      .whereHas('eventQuiz', (query) => {
        query.where('id', params.quizId).where('eventId', event.id)
      })
      .preload('choices')
      .firstOrFail()

    if (!question.isMcq) {
      return response.badRequest('Question is not MCQ type')
    }

    const data = await request.validateUsing(updateMcqQuestionValidator)

    try {
      await db.transaction(async (trx) => {
        await question
          .merge({
            questionText: data.questionText,
            questionImagePath: data.questionImagePath || null,
          })
          .useTransaction(trx)
          .save()

        const existingChoices = new Map(question.choices.map((choice) => [choice.id, choice]))
        const updatedChoiceIds = new Set()

        for (const choiceData of data.choices) {
          if (choiceData.id && existingChoices.has(choiceData.id)) {
            await trx.from('mcq_choices').where('id', choiceData.id).update({
              choice_text: choiceData.choiceText,
              is_correct: choiceData.isCorrect,
              explanation: choiceData.explanation,
            })
            updatedChoiceIds.add(choiceData.id)
          } else {
            const [newChoice] = await trx
              .insertQuery()
              .table('mcq_choices')
              .insert({
                question_id: question.id,
                choice_text: choiceData.choiceText,
                is_correct: choiceData.isCorrect,
                explanation: choiceData.explanation,
              })
              .returning('id')
            updatedChoiceIds.add(newChoice.id)
          }
        }

        const choicesToRemove = [...existingChoices.keys()].filter(
          (id) => !updatedChoiceIds.has(id)
        )
        if (choicesToRemove.length > 0) {
          await trx.from('mcq_choices').whereIn('id', choicesToRemove).delete()
        }
      })

      session.flash('success', 'Question updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to update quiz question', { ...context, error })
      throw error
    }
  }

  /**
   * Delete a quiz question
   */
  async deleteQuizQuestion({ params, response, session, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'deleteQuizQuestion',
      eventSlug: params.slug,
      quizId: params.quizId,
      questionSlug: params.questionSlug,
    }
    logger.info({ ...context, message: 'Deleting quiz question' })

    const event = await Event.findByOrFail('slug', params.slug)
    if (await bouncer.with(EventPolicy).denies('update', event)) {
      return response.forbidden()
    }

    const question = await Question.query()
      .where('slug', params.questionSlug)
      .whereHas('eventQuiz', (query) => {
        query.where('id', params.quizId).where('eventId', event.id)
      })
      .firstOrFail()

    try {
      await db.transaction(async (trx) => {
        await trx.from('mcq_choices').where('question_id', question.id).delete()
        await trx.from('questions').where('id', question.id).delete()
      })

      session.flash('success', 'Question deleted successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error('failed to delete quiz question', { ...context, error })
      throw error
    }
  }

  /**
   * Show leaderboard for a specific quiz
   */
  async showQuizLeaderboard({
    params,
    inertia,
    auth,
    bouncer,
    logger,
    response,
    request,
  }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'showQuizLeaderboard',
      slug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Fetching quiz leaderboard' })

    if (await bouncer.with(EventPolicy).denies('view')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized access attempt' })
      return response.forbidden()
    }

    const isApiRequest = request.header('accept')?.includes('application/json')

    try {
      // Get event and quiz
      const event = await Event.query().where('slug', params.slug).preload('user').firstOrFail()

      const quiz = await EventQuiz.query()
        .where('id', params.quizId)
        .where('eventId', event.id)
        .preload('questions')
        .firstOrFail()

      // Use service to get leaderboard data
      const leaderboardData = await QuizLeaderboardService.getQuizLeaderboard(quiz.id)

      const leaderboardResponse = {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
        },
        quiz: {
          id: quiz.id,
          title: quiz.title,
          slug: quiz.slug,
        },
        ...leaderboardData,
      }

      logger.info({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        quizId: quiz.id,
        participantsCount: leaderboardData.totalParticipants,
        message: 'Quiz leaderboard fetched successfully',
      })

      // Return JSON for API requests (TanStack Query)
      if (isApiRequest) {
        return response.json(leaderboardResponse)
      }

      // Return Inertia page for direct navigation
      return inertia.render('manage/events/quiz_leaderboard', {
        event: new EventDto(event),
        quiz: new EventQuizDto(quiz),
        leaderboardData: leaderboardResponse,
      })
    } catch (error) {
      logger.error('failed to fetch quiz leaderboard', { ...context, error })

      if (isApiRequest) {
        return response.status(500).json({ error: 'Failed to fetch leaderboard' })
      }

      throw error
    }
  }

  /**
   * Update user quiz statistics
   */
  async updateQuizStats({ params, request, response, auth, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'updateQuizStats',
      slug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Updating quiz stats' })

    const user = auth.getUserOrFail()

    const { questionsAttempted, questionsCorrect, completionPercentage, score, additionalData } =
      request.only([
        'questionsAttempted',
        'questionsCorrect',
        'completionPercentage',
        'score',
        'additionalData',
      ])

    try {
      // Verify event and quiz exist
      const event = await Event.query().where('slug', params.slug).firstOrFail()
      const quiz = await EventQuiz.query()
        .where('id', params.quizId)
        .where('eventId', event.id)
        .firstOrFail()

      // Use service to update user quiz stats
      const userQuizStat = await QuizLeaderboardService.updateUserQuizStats(user.id, quiz.id, {
        questionsAttempted: questionsAttempted || 0,
        questionsCorrect: questionsCorrect || 0,
        completionPercentage: completionPercentage || 0,
        score: score || 0,
        additionalData: additionalData || {},
      })

      logger.info({
        ...context,
        userId: user.id,
        quizId: quiz.id,
        message: 'Quiz stats updated successfully',
      })

      return response.json({
        success: true,
        userQuizStat: new UserQuizStatDto(userQuizStat),
      })
    } catch (error) {
      logger.error('failed to update quiz stats', { ...context, error })
      return response.status(500).json({ error: 'Failed to update quiz stats' })
    }
  }

  /**
   * Publish a quiz (set status to published)
   */
  async publishQuiz({ params, response, auth, bouncer, logger, session }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'publishQuiz',
      eventSlug: params.slug,
      quizId: params.quizId,
      userId: auth.user?.id,
    }
    logger.info({ ...context, message: 'Publishing quiz' })

    const event = await Event.findByOrFail('slug', params.slug)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({
        ...context,
        userId: auth.user?.id,
        eventId: event.id,
        message: 'Unauthorized update attempt',
      })
      return response.forbidden()
    }

    const quiz = await EventQuiz.query()
      .where('id', params.quizId)
      .whereHas('event', (eventQuery) => {
        eventQuery.where('slug', params.slug)
      })
      .firstOrFail()

    quiz.status = 'published'
    await quiz.save()

    logger.info({ ...context, message: 'Quiz published successfully' })
    session.flash('success', 'Quiz published successfully')
    return response.redirect().back()
  }
}
