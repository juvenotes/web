import { DateTime } from 'luxon'
import PastPaper from '#models/past_paper'
import Question from '#models/question'
import db from '@adonisjs/lucid/services/db'
import QuestionDeletionService from '#services/question_deletion_service'
import SaqPart from '#models/saq_part'
import McqChoice from '#models/mcq_choice'
import { QuestionType } from '#enums/question_types'

export default class PaperDeletionService {
  /**
   * Soft delete a paper and all its related questions
   */
  static async delete(paperId: number): Promise<void> {
    await db.transaction(async (trx) => {
      // Get the paper
      const paper = await PastPaper.findOrFail(paperId)

      // Get all questions for this paper
      const questions = await Question.query().where('past_paper_id', paper.id)

      // Soft delete each question using the existing question service
      for (const question of questions) {
        await QuestionDeletionService.delete(question.id)
      }

      // Mark paper as deleted
      paper.deletedAt = DateTime.now()
      await paper.useTransaction(trx).save()
    })
  }

  /**
   * Restore a soft-deleted paper and its questions
   */
  static async restore(paperId: number): Promise<void> {
    await db.transaction(async (trx) => {
      // Get the paper including deleted ones
      const paper = await PastPaper.query({ client: trx })
        .apply((scopes) => scopes.withTrashed())
        .where('id', paperId)
        .firstOrFail()

      // Clear deleted_at flag
      paper.deletedAt = null
      await paper.useTransaction(trx).save()

      // Find all soft-deleted questions for this paper
      const questions = await Question.query({ client: trx })
        .apply((scopes) => scopes.withTrashed())
        .where('past_paper_id', paper.id)
        .whereNotNull('deleted_at')

      // Restore each question and its related items
      for (const question of questions) {
        question.deletedAt = null
        await question.useTransaction(trx).save()

        // Restore related items based on question type
        if (question.type === QuestionType.MCQ) {
          await this.#restoreMcqChoices(question.id, trx)
        } else if (question.type === QuestionType.SAQ) {
          await this.#restoreSaqParts(question.id, trx)
        }
      }
    })
  }

  /**
   * Restore soft-deleted MCQ choices for a question
   */
  static async #restoreMcqChoices(questionId: number, trx: any): Promise<void> {
    // Find all soft-deleted choices for this question
    const choices = await McqChoice.query({ client: trx })
      .apply((scopes) => scopes.withTrashed())
      .where('question_id', questionId)
      .whereNotNull('deleted_at')

    // Restore each choice
    for (const choice of choices) {
      choice.deletedAt = null
      await choice.useTransaction(trx).save()
    }
  }

  /**
   * Restore soft-deleted SAQ parts for a question
   */
  static async #restoreSaqParts(questionId: number, trx: any): Promise<void> {
    // Find all soft-deleted parts for this question
    const parts = await SaqPart.query({ client: trx })
      .apply((scopes) => scopes.withTrashed())
      .where('question_id', questionId)
      .whereNotNull('deleted_at')

    // Restore each part
    for (const part of parts) {
      part.deletedAt = null
      await part.useTransaction(trx).save()
    }
  }
}
