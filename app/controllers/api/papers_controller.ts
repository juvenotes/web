import type { HttpContext } from '@adonisjs/core/http'
import PastPaper from '#models/past_paper'
import db from '@adonisjs/lucid/services/db'
import { QuestionType } from '#enums/question_types'

export default class PapersController {
  async addMcqQuestion({ request, response, auth }: HttpContext) {
    const {
      paperSlug,
      questionText,
      questionImagePath = null,
      choices = [],
    } = request.only(['conceptSlug', 'paperSlug', 'questionText', 'questionImagePath', 'choices'])

    if (!paperSlug) {
      return response.badRequest({ message: 'Missing paperSlug' })
    }
    if (!questionText || !choices.length) {
      return response.badRequest({ message: 'Missing questionText or choices' })
    }
    const paper = await PastPaper.findBy('slug', paperSlug)
    if (!paper) {
      return response.notFound({ message: 'Paper not found' })
    }
    const slug = Math.random().toString(36).substring(2, 10)
    try {
      await db.transaction(async (trx) => {
        const [question] = await trx
          .insertQuery()
          .table('questions')
          .insert({
            user_id: auth.user ? auth.user.id : null,
            past_paper_id: paper.id,
            slug,
            type: QuestionType.MCQ,
            question_text: questionText,
            question_image_path: questionImagePath,
          })
          .returning('*')
        await trx
          .insertQuery()
          .table('mcq_choices')
          .insert(
            choices.map((choice: any) => ({
              question_id: question.id,
              choice_text: choice.choiceText,
              is_correct: !!choice.isCorrect,
              explanation: choice.explanation || '',
            }))
          )
      })
      return response.ok({ message: 'MCQ added successfully' })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to add MCQ', error: String(error) })
    }
  }
}
