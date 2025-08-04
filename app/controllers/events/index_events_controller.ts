import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'

export default class IndexEventsController {
  /**
   * Display a list of events
   */
  async index({ inertia, request }: HttpContext) {
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

    const eventDtos = events.serialize({
      fields: {
        pick: [
          'id',
          'title',
          'slug',
          'description',
          'eventType',
          'status',
          'startDate',
          'endDate',
          'venue',
          'isOnline',
          'isFree',
          'price',
          'currency',
          'maxParticipants',
          'currentParticipants',
          'createdAt',
        ],
      },
    })

    return inertia.render('events/index', {
      events: eventDtos,
      filters: { search, eventType, status },
    })
  }

  /**
   * Show a single event
   */
  async show({ params, inertia }: HttpContext) {
    const event = await Event.query()
      .where('slug', params.slug)
      .where('status', 'published')
      .whereNull('deletedAt')
      .preload('user')
      .firstOrFail()

    const eventDto = new EventDto(event)

    return inertia.render('events/show', {
      event: eventDto,
    })
  }

  /**
   * Register for an event (API endpoint)
   */
  async register({ params, response }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)

    // Check if registration is still open
    if (event.registrationDeadline && new Date() > event.registrationDeadline.toJSDate()) {
      return response.badRequest({ message: 'Registration deadline has passed' })
    }

    // Check if event is full
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
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

    return response.ok({
      message: 'Successfully registered for event',
      event: new EventDto(event),
    })
  }
}
