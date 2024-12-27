import { ensureAdmin } from '#utils/ensure_admin'
import { generateSlug } from '#utils/slug_generator'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class BasicQuestionsSeeder extends BaseSeeder {
  async run() {
    const admin = await ensureAdmin()
    if (!admin) {
      throw new Error('Admin user must exist before seeding concepts')
    }

    const terminalConcepts = await db.from('concepts').where('is_terminal', true)

    for (const concept of terminalConcepts) {
      await db.transaction(async (trx) => {
        // Create 2 MCQs
        const mcqTemplate = (conceptTitle: string, number: number) => ({
          user_id: admin.id,
          slug: generateSlug(),
          type: 'mcq',
          question_text: `Basic MCQ ${number} about ${conceptTitle}?`,
          difficulty_level: 'medium',
          choices: [
            {
              choice_text: `Correct answer about ${conceptTitle}`,
              is_correct: true,
              explanation: `This is correct because it relates to ${conceptTitle}`,
            },
            {
              choice_text: 'Wrong answer 1',
              is_correct: false,
              explanation: 'This is incorrect',
            },
            {
              choice_text: 'Wrong answer 2',
              is_correct: false,
              explanation: 'This is incorrect',
            },
            {
              choice_text: 'Wrong answer 3',
              is_correct: false,
              explanation: 'This is incorrect',
            },
          ],
        })

        // Create 2 SAQs
        const saqTemplate = (conceptTitle: string, number: number) => ({
          user_id: admin.id,
          slug: generateSlug(),
          type: 'saq',
          question_text: `Basic SAQ ${number} about ${conceptTitle}?`,
          difficulty_level: 'medium',
          parts: [
            {
              part_text: `Explain the first aspect of ${conceptTitle}`,
              expected_answer: `Sample answer about ${conceptTitle} part 1`,
              marks: 3,
            },
            {
              part_text: `Describe the second aspect of ${conceptTitle}`,
              expected_answer: `Sample answer about ${conceptTitle} part 2`,
              marks: 2,
            },
          ],
        })

        // Create MCQs
        for (let i = 1; i <= 2; i++) {
          const mcq = mcqTemplate(concept.title, i)

          const [question] = await trx
            .insertQuery()
            .table('questions')
            .insert({
              user_id: mcq.user_id,
              slug: mcq.slug,
              type: mcq.type,
              question_text: mcq.question_text,
              difficulty_level: mcq.difficulty_level,
            })
            .returning('*')

          await trx
            .insertQuery()
            .table('mcq_choices')
            .insert(
              mcq.choices.map((choice) => ({
                question_id: question.id,
                ...choice,
              }))
            )

          await trx.insertQuery().table('concept_questions').insert({
            concept_id: concept.id,
            question_id: question.id,
          })
        }

        // Create SAQs
        for (let i = 1; i <= 2; i++) {
          const saq = saqTemplate(concept.title, i)

          const [question] = await trx
            .insertQuery()
            .table('questions')
            .insert({
              user_id: saq.user_id,
              slug: saq.slug,
              type: saq.type,
              question_text: saq.question_text,
              difficulty_level: saq.difficulty_level,
            })
            .returning('*')

          await trx
            .insertQuery()
            .table('saq_parts')
            .insert(
              saq.parts.map((part) => ({
                question_id: question.id,
                ...part,
              }))
            )

          await trx.insertQuery().table('concept_questions').insert({
            concept_id: concept.id,
            question_id: question.id,
          })
        }
      })
    }
  }
}
