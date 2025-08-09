import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'
import EventQuizDto from '#dtos/event_quiz'
import EventQuiz from '#models/event_quiz'
import QuestionDto from '#dtos/question'
import UserMcqResponse from '#models/user_mcq_response'

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

    const canManage = await bouncer.allows('canManage')

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: events.length,
      canManage,
      message: 'Events list fetched successfully',
    })

    return inertia.render('events/index', {
      events: events ? EventDto.fromArray(events) : [],
      canManage,
    })
  }

  /**
   * Show a single event
   */
  async show({ params, inertia, auth, logger, bouncer }: HttpContext) {
    const context = {
      controller: 'IndexEventsController',
      action: 'show',
      eventSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching event details' })

    const event = await Event.query()
      .where('slug', params.slug)
      .where('status', 'published')
      .preload('user')
      .preload('quizzes', (query) => {
        query.where('status', 'published').preload('questions', (q) => {
          q.preload('choices')
        })
      })
      .firstOrFail()

    const eventDto = new EventDto(event)
    const quizDtos = event.quizzes.map((quiz) => new EventQuizDto(quiz))

    const canManage = await bouncer.allows('canManage')

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
      canManage,
    })
  }

  /**
   * Show quiz page for an event
   */
  async quiz({ params, inertia, auth, logger, bouncer }: HttpContext) {
    const context = {
      controller: 'IndexEventsController',
      action: 'quiz',
      eventSlug: params.slug,
      quizId: params.quizId,
    }
    logger.info({ ...context, message: 'Fetching event quiz' })

    const event = await Event.findByOrFail('slug', params.slug)
    const quiz = await EventQuiz.query()
      .where('id', params.quizId)
      .where('eventId', event.id)
      .where('status', 'published')
      .preload('questions', (query) => {
        query.orderBy('id', 'asc').preload('choices')
      })
      .firstOrFail()

    const eventDto = new EventDto(event)
    const quizDto = new EventQuizDto(quiz)
    const questionsDto = quiz.questions ? QuestionDto.fromArray(quiz.questions) : []

    const canManage = await bouncer.allows('canManage')

    // Fetch attempted question IDs for this user and quiz
    let attemptedQuestionIds: number[] = []
    if (auth.user) {
      const responses = await UserMcqResponse.query()
        .where('userId', auth.user.id)
        .where('source', 'event_quiz')
        .whereIn(
          'questionId',
          quiz.questions.map((q) => q.id)
        )
        .distinct('questionId')
      attemptedQuestionIds = responses.map((r) => r.questionId)
    }

    logger.info({
      ...context,
      userId: auth.user?.id,
      eventId: event.id,
      quizId: quiz.id,
      questionsCount: questionsDto.length,
      attemptedQuestionIds,
      message: 'Event quiz fetched successfully',
    })

    return inertia.render('events/quiz', {
      event: eventDto,
      quiz: quizDto,
      questions: questionsDto,
      canManage,
      attemptedQuestionIds,
    })
  }
}
