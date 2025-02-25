import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import QuestionFeedback from '#models/question_feedback'
import { createFeedbackValidator } from '#validators/question'

@inject()
export default class QuestionFeedbackController {
  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createFeedbackValidator)

    try {
      await QuestionFeedback.create({
        userId: user.id,
        questionId: data.questionId,
        feedbackText: data.feedbackText,
        feedbackTarget: data.feedbackTarget,
        feedbackSource: data.feedbackSource,
      })

      session.flash('success', 'Feedback submitted successfully')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Failed to submit feedback')
      return response.redirect().back()
    }
  }
}
