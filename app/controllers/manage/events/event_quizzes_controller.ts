import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventQuiz from '#models/event_quiz'
import EventPolicy from '#policies/event_policy'
import { createEventQuizValidator, updateEventQuizValidator } from '#validators/event_quiz'
import { generateSlug } from '#utils/slug_generator'
import db from '@adonisjs/lucid/services/db'

export default class EventQuizzesController {
  /**
   * Store a new quiz for an event
   */
  async store({ params, request, response, session, auth, bouncer }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    if (await bouncer.with(EventPolicy).denies('update', event)) {
      return response.forbidden()
    }
    const data = await request.validateUsing(createEventQuizValidator)

    try {
      await db.transaction(async (trx) => {
        await EventQuiz.create(
          {
            userId: auth.user!.id,
            eventId: event.id,
            title: data.title,
            slug: generateSlug(),
            description: data.description || null,
            status: data.status || 'draft',
            durationMinutes: data.durationMinutes,
            hasTimer: data.hasTimer,
            autoSubmit: data.autoSubmit,
            lockdownMode: data.lockdownMode,
            quizMode: data.quizMode,
            timeLimit: data.timeLimit,
            startTime: data.startTime ? DateTime.fromJSDate(data.startTime) : null,
            endTime: data.endTime ? DateTime.fromJSDate(data.endTime) : null,
          },
          { client: trx }
        )
        session.flash('success', 'Quiz created successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a quiz
   */
  async update({ params, request, response, session, bouncer }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    if (await bouncer.with(EventPolicy).denies('update', event)) {
      return response.forbidden()
    }
    const quiz = await EventQuiz.findOrFail(params.quizId)
    const data = await request.validateUsing(updateEventQuizValidator)

    try {
      await db.transaction(async (trx) => {
        quiz.useTransaction(trx)
        await quiz
          .merge({
            title: data.title || quiz.title,
            description: data.description !== undefined ? data.description : quiz.description,
            status: data.status || quiz.status,
            durationMinutes: data.durationMinutes,
            hasTimer: data.hasTimer,
            autoSubmit: data.autoSubmit,
            lockdownMode: data.lockdownMode,
            quizMode: data.quizMode,
            timeLimit: data.timeLimit,
            startTime: data.startTime ? DateTime.fromJSDate(data.startTime) : quiz.startTime,
            endTime: data.endTime ? DateTime.fromJSDate(data.endTime) : quiz.endTime,
          })
          .save()
        session.flash('success', 'Quiz updated successfully')
        return response.redirect().toRoute('manage.events.show', { slug: event.slug })
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a quiz
   */
  async destroy({ params, response, session, bouncer }: HttpContext) {
    const event = await Event.findByOrFail('slug', params.slug)
    if (await bouncer.with(EventPolicy).denies('update', event)) {
      return response.forbidden()
    }
    const quiz = await EventQuiz.findOrFail(params.quizId)

    try {
      await db.transaction(async (trx) => {
        quiz.useTransaction(trx)
        await quiz.delete()
        session.flash('success', 'Quiz deleted successfully')
        return response.redirect().toRoute('manage.events.show', { slug: params.slug })
      })
    } catch (error) {
      throw error
    }
  }
}
