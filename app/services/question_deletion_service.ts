import Question from '#models/question'
import McqChoice from '#models/mcq_choice'
import SaqPart from '#models/saq_part'
import { ResponseStatus } from '#enums/response_status'
import { QuestionType } from '#enums/question_types'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Station from '#models/station'

export default class QuestionService {
  /**
   * Soft delete a question and all its related data
   */
  static async delete(questionId: number): Promise<void> {
    await db.transaction(async (trx) => {
      // Get question with its type
      const question = await Question.findOrFail(questionId)

      // Handle different question types
      if (question.type === QuestionType.MCQ) {
        await this.#handleMcqDeletion(question, trx)
      } else if (question.type === QuestionType.SAQ) {
        await this.#handleSaqDeletion(question, trx)
      } else if (question.type === QuestionType.OSCE) {
        await this.#handleOsceDeletion(question, trx)
      }

      // Mark question as deleted
      question.deletedAt = DateTime.now()
      await question.useTransaction(trx).save()
    })
  }

  /**
   * Handle deletion of MCQ question type
   */
  static async #handleMcqDeletion(
    question: Question,
    trx: TransactionClientContract
  ): Promise<void> {
    // Get all choices for this question
    const choices = await McqChoice.query().where('question_id', question.id).useTransaction(trx)

    // Soft delete each choice and update responses
    for (const choice of choices) {
      // Update responses to DELETED status
      await trx.from('user_mcq_responses').where('choice_id', choice.id).update({
        status: ResponseStatus.DELETED,
        original_choice_text: choice.choiceText,
      })

      // Soft delete the choice
      choice.deletedAt = DateTime.now()
      await choice.useTransaction(trx).save()
    }
  }

  /**
   * Handle deletion of SAQ question type
   */
  static async #handleSaqDeletion(
    question: Question,
    trx: TransactionClientContract
  ): Promise<void> {
    // Get all parts for this question
    const parts = await SaqPart.query().where('question_id', question.id).useTransaction(trx)

    // Soft delete each part and update responses
    for (const part of parts) {
      // Update responses to DELETED status
      await trx.from('user_saq_responses').where('part_id', part.id).update({
        status: ResponseStatus.DELETED,
        original_part_text: part.partText,
      })

      // Soft delete the part
      part.deletedAt = DateTime.now()
      await part.useTransaction(trx).save()
    }
  }

  /**
   * Handle deletion of OSCE question type
   */
  static async #handleOsceDeletion(
    question: Question,
    trx: TransactionClientContract
  ): Promise<void> {
    // Get all stations for this question
    const stations = await Station.query().where('question_id', question.id).useTransaction(trx)

    for (const station of stations) {
      // Update responses to DELETED status
      await trx.from('user_osce_responses').where('station_id', station.id).update({
        status: ResponseStatus.DELETED,
        original_station_text: station.partText,
      })

      // Soft delete the station
      station.deletedAt = DateTime.now()
      await station.useTransaction(trx).save()
    }
  }
}
