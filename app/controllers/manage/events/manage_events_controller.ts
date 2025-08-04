import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'
import EventQuizDto from '#dtos/event_quiz'
import EventQuiz from '#models/event_quiz'
import { createEventValidator, updateEventValidator } from '#validators/event'
import string from '@adonisjs/core/helpers/string'

export default class ManageEventsController {
  /**
   * Display a list of events for management
   */
  async index({ inertia, request }: HttpContext) {
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

    return inertia.render('manage/events/index', {
      events: eventDtos,
      filters: { search, status, eventType },
    })
  }

  /**
   * Show event creation form
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('manage/events/create')
  }

  /**
   * Store a new event
   */
  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createEventValidator)

    // Generate slug
    const slug = string.slug(data.title)

    // Check if slug already exists
    const existingEvent = await Event.findBy('slug', slug)
    if (existingEvent) {
      session.flash('error', 'An event with this title already exists')
      return response.redirect().back()
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
      currency: data.currency || 'USD',
      maxParticipants: data.maxParticipants,
      metadata: data.metadata || {},
    })

    session.flash('success', 'Event created successfully')
    return response.redirect().toRoute('manage.events.show', { slug: event.slug })
  }

  /**
   * Show a single event for management
   */
  async show({ params, inertia }: HttpContext) {
    const event = await Event.query()
      .where('slug', params.slug)
      .preload('user')
      .preload('quizzes')
      .firstOrFail()

    const eventDto = new EventDto(event)
    const quizDtos = event.quizzes.map((quiz) => new EventQuizDto(quiz))

    return inertia.render('manage/events/show', {
      event: eventDto,
      quizzes: quizDtos,
    })
  }

  /**
   * Show edit form for an event
   */
  async edit({ params, inertia }: HttpContext) {
    const event = await Event.query().where('slug', params.slug).preload('user').firstOrFail()

    const eventDto = new EventDto(event)

    return inertia.render('manage/events/edit', {
      event: eventDto,
    })
  }

  /**
   * Update an event
   */
  async update({ params, request, response, session }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    const data = await request.validateUsing(updateEventValidator)

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
        metadata: data.metadata,
      })
      .save()

    session.flash('success', 'Event updated successfully')
    return response.redirect().toRoute('manage.events.show', { slug: event.slug })
  }

  /**
   * Delete an event (soft delete)
   */
  async destroy({ params, response, session }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)

    await event.delete()

    session.flash('success', 'Event deleted successfully')
    return response.redirect().toRoute('manage.events.index')
  }

  /**
   * Show quiz creation form
   */
  async createQuiz({ params, inertia }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    const eventDto = new EventDto(event)

    return inertia.render('manage/events/create-quiz', {
      event: eventDto,
    })
  }

  /**
   * Store a new quiz for an event
   */
  async storeQuiz({ params, request, response, session }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    const data = request.only(['title', 'description', 'mcqs'])

    await EventQuiz.create({
      eventId: event.id,
      title: data.title,
      description: data.description,
      mcqs: data.mcqs || [],
    })

    session.flash('success', 'Quiz created successfully')
    return response.redirect().toRoute('manage.events.show', { slug: event.slug })
  }

  /**
   * Show quiz edit form
   */
  async editQuiz({ params, inertia }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.findOrFail(params.quizId)

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
  async updateQuiz({ params, request, response, session }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.findOrFail(params.quizId)
    const data = request.only(['title', 'description', 'mcqs'])

    await quiz
      .merge({
        title: data.title,
        description: data.description,
        mcqs: data.mcqs,
      })
      .save()

    session.flash('success', 'Quiz updated successfully')
    return response.redirect().toRoute('manage.events.show', { slug: event.slug })
  }

  /**
   * Delete a quiz
   */
  async destroyQuiz({ params, response, session }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.findOrFail(params.quizId)

    await quiz.delete()

    session.flash('success', 'Quiz deleted successfully')
    return response.redirect().toRoute('manage.events.show', { slug: event.slug })
  }
}
