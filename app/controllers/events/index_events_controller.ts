import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'
import EventQuizDto from '#dtos/event_quiz'
import db from '@adonisjs/lucid/services/db'

export default class IndexEventsController {
  /**
   * Display a list of events
   */
  async index({ inertia, request, auth, logger, bouncer }: HttpContext) {
    const context = {
      controller: 'IndexEventsController',
      action: 'index',
    }
    logger.info({ ...context, message: 'Fetching events list' })

    const page = request.input('page', 1)
    const search = request.input('search', '')
    const eventType = request.input('eventType', '')
    const status = request.input('status', 'published')

    const events = await Event.query()
      .if(search, (query) => {
        query.whereILike('title', `%${search}%`).orWhereILike('description', `%${search}%`)
      })
      .if(eventType, (query) => query.where('eventType', eventType))
      .where('status', status)
      .whereNull('deletedAt')
      .orderBy('startDate', 'asc')
      .preload('user')
      .paginate(page, 12)

    // Check if user can manage events (use bouncer)
    const canManage = await bouncer.allows('canManage')

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: events.length,
      canManage,
      message: 'Events list fetched successfully',
    })

    // Pass DTOs to the view, not raw data
    return inertia.render('events/index', {
      events: EventDto.fromArray(events.all()),
      filters: { search, eventType, status },
      canManage,
    })
  }

  /**
   * Show a single event
   */
  async show({ params, inertia, auth, logger }: HttpContext) {
    const context = {
      controller: 'IndexEventsController',
      action: 'show',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching event details' })

    const event = await Event.query()
      .where('slug', params.slug)
      .where('status', 'published')
      .whereNull('deletedAt')
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
      message: 'Event details fetched successfully',
    })

    return inertia.render('events/show', {
      event: eventDto,
      quizzes: quizDtos,
    })
  }

  /**
   * Show quiz page for an event
   */
  async quiz({ params, inertia, auth, logger }: HttpContext) {
    const context = {
      controller: 'IndexEventsController',
      action: 'quiz',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Fetching event quiz' })

    const event = await Event.query()
      .where('slug', params.slug)
      .where('status', 'published')
      .whereNull('deletedAt')
      .preload('quizzes')
      .firstOrFail()

    const quiz = event.quizzes.find((q) => q.id === Number(params.quizId))
    if (!quiz) {
      logger.warn({ ...context, message: 'Quiz not found' })
      throw new Error('Quiz not found')
    }

    const eventDto = new EventDto(event)
    const quizDto = new EventQuizDto(quiz)

    logger.info({
      ...context,
      userId: auth.user?.id,
      eventId: event.id,
      quizId: quiz.id,
      message: 'Event quiz fetched successfully',
    })

    return inertia.render('events/quiz', {
      event: eventDto,
      quiz: quizDto,
    })
  }

  /**
   * Register for an event (API endpoint)
   */
  async register({ params, response, auth, logger, bouncer }: HttpContext) {
    const context = {
      controller: 'IndexEventsController',
      action: 'register',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Processing event registration' })

    // Authorization: Only allow users with correct roles
    const canRegister = await bouncer.allows('canManage')
    if (!canRegister) {
      return response.forbidden({ message: 'You are not authorized to register for events.' })
    }

    try {
      await db.transaction(async (trx) => {
        const event = await Event.findByOrFail('slug', params.slug)
        event.useTransaction(trx)

        // Check if registration is still open
        if (event.registrationDeadline && new Date() > event.registrationDeadline.toJSDate()) {
          logger.warn({ ...context, eventId: event.id, message: 'Registration deadline passed' })
          return response.badRequest({ message: 'Registration deadline has passed' })
        }

        // Check if event is full
        if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
          logger.warn({ ...context, eventId: event.id, message: 'Event is full' })
          return response.badRequest({ message: 'Event is full' })
        }

        // TODO: Implement actual registration logic
        // This could involve creating a user_event_registrations table
        // For now, just increment the participant count

        await event
          .merge({
            currentParticipants: event.currentParticipants + 1,
          })
          .save()

        logger.info({
          ...context,
          userId: auth.user?.id,
          eventId: event.id,
          newParticipantCount: event.currentParticipants,
          message: 'Event registration successful',
        })

        return response.ok({
          message: 'Successfully registered for event',
          event: new EventDto(event),
        })
      })
    } catch (error) {
      logger.error({ ...context, error, message: 'Event registration failed' })
      throw error
    }
  }
}
