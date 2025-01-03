import type { HttpContext } from '@adonisjs/core/http'
import Paper from '#models/past_paper'
import Question from '#models/question'
import { createQuestionValidator } from '#validators/question'
import QuestionPolicy from '#policies/question_policy'
import db from '@adonisjs/lucid/services/db'
import { ManagePaperDto } from '#dtos/manage_paper_dto'

export default class ManagePapersController {
  async index({ inertia, bouncer }: HttpContext) {
    // await bouncer.with(PaperPolicy).authorize('view')

    const papers = await Paper.query()
      .preload('concept')
      .preload('questions')
      .orderBy('created_at', 'desc')

    const papersByConcept = papers.reduce(
      (acc, paper) => {
        const title = paper.concept.title
        if (!acc[title]) acc[title] = []
        acc[title].push(new ManagePaperDto(paper).toJSON())
        return acc
      },
      {} as Record<string, ReturnType<ManagePaperDto['toJSON']>[]>
    )

    return inertia.render('manage/papers/index', { papersByConcept })
  }

  async show({ params, inertia, bouncer }: HttpContext) {
    const paper = await Paper.query()
      .where('slug', params.slug)
      .preload('concept')
      .preload('questions', (query) => {
        query.preload('choices').preload('parts')
      })
      .firstOrFail()

    await bouncer.with(PaperPolicy).authorize('view')

    return inertia.render('manage/papers/show', {
      paper: new ManagePaperDto(paper).toJSON(),
    })
  }
}

// export default class PapersController {
//   async index({ inertia }: HttpContext) {
//     const papers = await Paper.query()
//       .preload('questions')
//       .preload('concept')
//       .orderBy('created_at', 'desc')

//     // Group papers by concept
//     const papersByConcept = papers.reduce(
//       (acc, paper) => {
//         const conceptTitle = paper.concept.title
//         if (!acc[conceptTitle]) {
//           acc[conceptTitle] = []
//         }
//         acc[conceptTitle].push(paper)
//         return acc
//       },
//       {} as Record<string, typeof papers>
//     )

//     return inertia.render('manage/papers/index', { papersByConcept })
//   }

//   async show({ params, inertia, bouncer }: HttpContext) {
//     const paper = await Paper.query()
//       .where('slug', params.slug)
//       .preload('questions', (query) => {
//         query.preload('choices').preload('parts')
//       })
//       .preload('concept')
//       .firstOrFail()

//     await bouncer.with(QuestionPolicy).authorize('view')

//     return inertia.render('manage/papers/show', { paper })
//   }

//   async createQuestion({ params, request, inertia }: HttpContext) {
//     const paper = await Paper.findByOrFail('slug', params.slug)
//     const type = request.qs().type || 'mcq'

//     return inertia.render('manage/papers/questions/create', {
//       paper,
//       type,
//       question: {
//         type,
//         question_text: '',
//         difficulty_level: 'medium',
//         choices: type === 'mcq' ? Array(4).fill({ choice_text: '', is_correct: false }) : [],
//         parts: type === 'saq' ? [] : [],
//       },
//     })
//   }

//   async addQuestion({ params, request, response, bouncer, auth }: HttpContext) {
//     const paper = await Paper.findByOrFail('slug', params.slug)

//     if (await bouncer.with(QuestionPolicy).denies('create')) {
//       return response.forbidden('Cannot create questions')
//     }

//     const data = await request.validateUsing(createQuestionValidator)

//     await db.transaction(async (trx) => {
//       const question = await Question.create(
//         {
//           ...data,
//           userId: auth.user!.id,
//           pastPaperId: paper.id,
//         },
//         { client: trx }
//       )

//       if (data.type === 'mcq' && data.choices) {
//         await question.related('choices').createMany(data.choices, { client: trx })
//       }

//       if (data.type === 'saq' && data.parts) {
//         await question.related('parts').createMany(data.parts, { client: trx })
//       }
//     })

//     return response.redirect().back()
//   }

//   async editQuestion({ params, inertia, bouncer, response }: HttpContext) {
//     const paper = await Paper.findByOrFail('slug', params.slug)
//     const question = await Question.query()
//       .where('slug', params.questionSlug)
//       .preload('choices')
//       .preload('parts')
//       .firstOrFail()

//     if (await bouncer.with(QuestionPolicy).denies('update', question)) {
//       return response.forbidden('Cannot edit question')
//     }

//     return inertia.render('manage/papers/questions/edit', {
//       paper,
//       question,
//     })
//   }

//   async removeQuestion({ params, response, bouncer }: HttpContext) {
//     const paper = await Paper.findByOrFail('slug', params.paperSlug)
//     const question = await Question.findByOrFail('slug', params.questionSlug)

//     if (await bouncer.with(QuestionPolicy).denies('delete', question)) {
//       return response.forbidden('Cannot delete question')
//     }

//     await question.delete()
//     return response.redirect().back()
//   }
// }
