import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'
import EventQuizDto from '#dtos/event_quiz'
import EventQuiz from '#models/event_quiz'
import { createEventValidator, updateEventValidator } from '#validators/event'
import string from '@adonisjs/core/helpers/string'
import { CloudinaryService } from '#services/cloudinary_service'
import { MCQParser, MCQParserError } from '#services/mcq_parser_service'
import fs from 'node:fs/promises'
import EventPolicy from '#policies/event_policy'
import db from '@adonisjs/lucid/services/db'

export default class ManageEventsController {
  /**
   * Display a list of events for management
   */
  async index({ inertia, request, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'index',
    }
    logger.info({ ...context, message: 'Fetching events for management' })

    if (await bouncer.with(EventPolicy).denies('view')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized access attempt' })
      return inertia.render('errors/forbidden')
    }

    const page = request.input('page', 1)
    const search = request.input('search', '')
    const status = request.input('status', '')
    const eventType = request.input('eventType', '')

    const events = await Event.query()
      .if(search, (query) => {
        query.whereILike('title', `%${search}%`).orWhereILike('description', `%${search}%`)
      })
      .if(status, (query) => query.where('status', status))
      .if(eventType, (query) => query.where('eventType', eventType))
      .orderBy('createdAt', 'desc')
      .preload('user')
      .paginate(page, 15)

    const eventDtos = events.serialize().data.map((event: any) => new EventDto(event))

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: eventDtos.length,
      message: 'Events fetched for management',
    })

    return inertia.render('manage/events/index', {
      events: eventDtos,
      filters: { search, status, eventType },
    })
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
            logger.error({ ...context, error, message: 'Image upload failed' })
            session.flash('error', 'Failed to upload image')
            return response.redirect().back()
          }
        }

        const event = await Event.create({
          userId: user.id,
          title: data.title,
          slug,
          description: data.description,
          content: data.content,
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
          metadata: data.metadata || {},
        })

        logger.info({
          ...context,
          userId: user.id,
          eventId: event.id,
          slug: event.slug,
          message: 'Event created successfully',
        })

        session.flash('success', 'Event created successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      logger.error({ ...context, userId: user.id, error, message: 'Event creation failed' })
      throw error
    }
  }

  /**
   * Show a single event for management
   */
  async show({ params, inertia, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'show',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching event for management' })

    if (await bouncer.with(EventPolicy).denies('view')) {
      logger.warn({ ...context, userId: auth.user?.id, message: 'Unauthorized view attempt' })
      return inertia.render('errors/forbidden')
    }

    const event = await Event.query()
      .where('slug', params.slug)
      .preload('user')
      .preload('quizzes')
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
  async edit({ params, inertia, auth, bouncer, logger }: HttpContext) {
    const context = {
      controller: 'ManageEventsController',
      action: 'edit',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Showing event edit form' })

    const event = await Event.query().where('slug', params.slug).preload('user').firstOrFail()

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized edit attempt' })
      return inertia.render('errors/forbidden')
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized update attempt' })
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
            logger.error({ ...context, error, message: 'Image upload failed' })
            session.flash('error', 'Failed to upload image')
            return response.redirect().back()
          }
        }

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
            metadata: data.metadata,
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
      logger.error({ ...context, userId: auth.user?.id, eventId: event.id, error, message: 'Event update failed' })
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized delete attempt' })
      return response.forbidden()
    }

    try {
      await db.transaction(async (trx) => {
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
      logger.error({ ...context, userId: auth.user?.id, eventId: event.id, error, message: 'Event deletion failed' })
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized quiz create form access' })
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized quiz create attempt' })
      return response.forbidden()
    }

    const data = request.only(['title', 'description', 'mcqs'])

    try {
      await db.transaction(async (trx) => {
        const quiz = await EventQuiz.create({
          eventId: event.id,
          title: data.title,
          description: data.description,
          mcqs: data.mcqs || [],
        })

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
      logger.error({ ...context, userId: auth.user?.id, eventId: event.id, error, message: 'Quiz creation failed' })
      throw error
    }
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
    const quiz = await EventQuiz.findOrFail(params.quizId)

    if (await bouncer.with(EventPolicy).denies('update', event)) {
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized quiz edit form access' })
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized quiz update attempt' })
      return response.forbidden()
    }

    const data = request.only(['title', 'description', 'mcqs'])

    try {
      await db.transaction(async (trx) => {
        await quiz
          .merge({
            title: data.title,
            description: data.description,
            mcqs: data.mcqs,
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
      logger.error({ ...context, userId: auth.user?.id, eventId: event.id, quizId: quiz.id, error, message: 'Quiz update failed' })
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized quiz delete attempt' })
      return response.forbidden()
    }

    try {
      await db.transaction(async (trx) => {
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
      logger.error({ ...context, userId: auth.user?.id, eventId: event.id, quizId: quiz.id, error, message: 'Quiz deletion failed' })
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
      logger.warn({ ...context, userId: auth.user?.id, eventId: event.id, message: 'Unauthorized quiz upload attempt' })
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
        const parsedQuestions = MCQParser.parse(content)

        logger.info('quiz questions parsed', {
          ...context,
          count: parsedQuestions.length,
          eventId: event.id,
          title,
        })

        // Convert parsed questions to the format expected by EventQuiz
        const mcqs = parsedQuestions.map((question, index) => ({
          question: question.stem,
          choices: question.choices,
          correctAnswer: question.choices.findIndex((choice) => choice === question.answer),
          explanation: question.explanation || '',
        }))

        // Create the quiz with the parsed questions
        const quiz = await EventQuiz.create({
          eventId: event.id,
          title,
          description: description || null,
          mcqs,
        })

        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          quizId: quiz.id,
          questionsCount: parsedQuestions.length,
          message: 'Quiz uploaded successfully',
        })

        session.flash('success', `Successfully uploaded quiz with ${parsedQuestions.length} questions`)
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
}
