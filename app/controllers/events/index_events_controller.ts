import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#dtos/event'
import EventQuizDto from '#dtos/event_quiz'
import EventQuiz from '#models/event_quiz'
import QuestionDto from '#dtos/question'
import UserProgressService from '#services/user_progress_service'
import { QuizSessionService } from '#services/quiz_session_service'
import { inject } from '@adonisjs/core'

@inject()
export default class IndexEventsController {
  constructor(
    private userProgressService: UserProgressService,
    private quizSessionService: QuizSessionService
  ) {}
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

    // Fetch attempted question IDs and user responses for this user and quiz
    let attemptedQuestionIds: number[] = []
    let userResponses: Record<number, { choiceId: number; isCorrect: boolean }> = {}
    let quizSession = null
    let timeRemaining = null
    
    if (auth.user) {
      attemptedQuestionIds = await this.userProgressService.getEventQuizAttemptedQuestions(
        auth.user.id,
        quiz.id
      )
      userResponses = await this.userProgressService.getEventQuizUserResponses(
        auth.user.id,
        quiz.id
      )
      
      // Get quiz session info for timer
      quizSession = await this.quizSessionService.getActiveSession(auth.user.id, quiz.id)
      if (quizSession) {
        timeRemaining = await this.quizSessionService.getSessionTimeRemaining(auth.user.id, quiz.id)
      }
    }

    logger.info({
      ...context,
      userId: auth.user?.id,
      eventId: event.id,
      quizId: quiz.id,
      questionsCount: questionsDto.length,
      attemptedQuestionIds,
      hasActiveSession: !!quizSession,
      message: 'Event quiz fetched successfully',
    })

    return inertia.render('events/quiz', {
      event: eventDto,
      quiz: quizDto,
      questions: questionsDto,
      canManage,
      attemptedQuestionIds,
      userResponses,
      quizSession: quizSession ? {
        id: quizSession.id,
        startedAt: quizSession.startedAt?.toISO(),
        timeRemaining
      } : null
    })
  }

  /**
   * Submit a quiz answer (for tracking attempted questions)
   */
  async submitQuizAnswer({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized()
    }

    const { quizId, questionId, choiceId, isCorrect } = request.only([
      'quizId',
      'questionId',
      'choiceId',
      'isCorrect',
    ])

    try {
      await this.userProgressService.recordEventQuizAttempt(
        auth.user.id,
        quizId,
        questionId,
        choiceId,
        isCorrect
      )

      return response.ok({ success: true })
    } catch (error: any) {
      if (error.message?.includes('already answered')) {
        return response.badRequest({ error: 'You have already answered this question' })
      }
      throw error
    }
  }

  /**
   * Start a quiz session with student authentication
   */
  async startQuizSession({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized()
    }

    const { quizId, studentId, school } = request.only([
      'quizId', 
      'studentId',
      'school'
    ])

    try {
      const session = await this.quizSessionService.startSession(
        auth.user.id,
        quizId,
        studentId,
        school
      )

      const timeRemaining = await this.quizSessionService.getSessionTimeRemaining(
        auth.user.id,
        quizId
      )

      return response.ok({
        success: true,
        session: {
          id: session.id,
          startedAt: session.startedAt?.toISO(),
          timeRemaining
        }
      })
    } catch (error) {
      console.error('Failed to start quiz session:', error)
      return response.internalServerError({ error: 'Failed to start quiz session' })
    }
  }

  /**
   * Record suspicious activity during quiz
   */
  async recordSuspiciousActivity({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized()
    }

    const { quizId, activityType, data } = request.only([
      'quizId',
      'activityType',
      'data'
    ])

    try {
      const session = await this.quizSessionService.recordActivity(
        auth.user.id,
        quizId,
        activityType,
        data
      )

      // Check if auto-submit should be triggered
      const shouldAutoSubmit = await this.quizSessionService.checkAutoSubmit(
        auth.user.id,
        quizId
      )

      return response.ok({
        success: true,
        autoSubmitTriggered: shouldAutoSubmit,
        session: session ? {
          tabSwitches: session.tabSwitches,
          focusLosses: session.focusLosses
        } : null
      })
    } catch (error) {
      console.error('Failed to record suspicious activity:', error)
      return response.internalServerError({ error: 'Failed to record activity' })
    }
  }

  /**
   * Submit quiz session
   */
  async submitQuizSession({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized()
    }

    const { quizId, autoSubmitted = false } = request.only(['quizId', 'autoSubmitted'])

    try {
      const session = await this.quizSessionService.submitSession(
        auth.user.id,
        quizId,
        autoSubmitted
      )

      return response.ok({
        success: true,
        session: session ? {
          id: session.id,
          endedAt: session.endedAt?.toISO(),
          autoSubmitted: session.autoSubmitted
        } : null
      })
    } catch (error) {
      console.error('Failed to submit quiz session:', error)
      return response.internalServerError({ error: 'Failed to submit quiz session' })
    }
  }

  /**
   * Get current session time remaining
   */
  async getSessionTimeRemaining({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized()
    }

    const { quizId } = request.only(['quizId'])

    try {
      const timeRemaining = await this.quizSessionService.getSessionTimeRemaining(
        auth.user.id,
        quizId
      )

      return response.ok({
        timeRemaining
      })
    } catch (error) {
      console.error('Failed to get session time:', error)
      return response.internalServerError({ error: 'Failed to get session time' })
    }
  }
}
