// import { HttpContext } from '@adonisjs/core/http'
// import { inject } from '@adonisjs/core'
// import QuestionFeedback from '#models/question_feedback'
// import QuestionFeedbackDto from '#dtos/question_feedback'
// import { DateTime } from 'luxon'

// @inject()
// export default class ManageFeedbackController {
//   async index({ request, inertia }: HttpContext) {
//     const page = request.input('page', 1)
//     const limit = 20
//     const isResolved = request.input('isResolved') === 'true'
//     const target = request.input('target')
//     const questionId = request.input('questionId')

//     const query = QuestionFeedback.query()
//       .preload('user')
//       .preload('question', (questionQuery) => {
//         questionQuery.preload('pastPaper', (paperQuery) => {
//           paperQuery.preload('concept')
//         })
//       })
//       .where('isResolved', isResolved)

//     if (target) {
//       query.where('feedbackTarget', target)
//     }

//     if (questionId) {
//       query.where('questionId', questionId)
//     }

//     const feedbackItems = await query.orderBy('createdAt', 'desc').paginate(page, limit)

//     return inertia.render('manage/feedback/index', {
//       feedbackItems: feedbackItems.map((item) => new QuestionFeedbackDto(item)),
//       pagination: feedbackItems.getMeta(),
//       filters: {
//         isResolved,
//         target,
//         questionId,
//       },
//     })
//   }

//   async markAsResolved({ params, response, auth, session }: HttpContext) {
//     const { id } = params

//     try {
//       const feedback = await QuestionFeedback.findOrFail(id)

//       feedback.isResolved = true
//       feedback.resolvedAt = DateTime.now()
//       feedback.resolvedBy = auth.user!.id

//       await feedback.save()

//       session.flash('success', 'Feedback marked as resolved')
//       return response.redirect().back()
//     } catch (error) {
//       session.flash('error', 'Failed to update feedback status')
//       return response.redirect().back()
//     }
//   }
// }
