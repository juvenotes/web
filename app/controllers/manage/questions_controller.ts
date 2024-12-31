import type { HttpContext } from '@adonisjs/core/http'
import Question from '#models/question'
import QuestionPolicy from '#policies/question_policy'
import { createQuestionValidator, updateQuestionValidator } from '#validators/question'
import db from '@adonisjs/lucid/services/db'
import Concept from '#models/concept'

export default class ManageQuestionsController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(QuestionPolicy).denies('view')) {
      return response.forbidden('Cannot view questions')
    }

    const concepts = await Concept.query()
      .whereNull('parent_id')
      .preload('children', (childrenQuery) => {
        childrenQuery
          .select(['id', 'title', 'parent_id', 'is_terminal', 'slug'])
          .withCount('questions', (countQuery) => {
            countQuery.as('question_count')
          })
      })
      .preload('questions', (questionsQuery) => {
        questionsQuery
          .select(['id', 'question_text', 'type', 'difficulty_level', 'slug'])
          .whereHas('concepts', (conceptQuery) => {
            conceptQuery.where('is_terminal', true)
          })
      })
      .select(['id', 'title', 'is_terminal', 'slug'])
      .orderBy('level', 'asc')

    const transformedConcepts = concepts.map((concept) => {
      if (concept.isTerminal) {
        return {
          id: concept.id,
          title: concept.title,
          slug: concept.slug,
          isTerminal: true,
          questions: concept.questions.map((q) => ({
            ...q,
            slug: q.slug,
          })),
          questionCount: concept.questions.length,
        }
      }

      return {
        id: concept.id,
        title: concept.title,
        isTerminal: false,
        slug: concept.slug,
        children: concept.children.map((child) => ({
          id: child.id,
          title: child.title,
          isTerminal: child.isTerminal,
          slug: child.slug,
          questionCount: Number(child.$extras.question_count || 0),
        })),
        questionCount: concept.children.reduce(
          (sum, child) => sum + Number(child.$extras.question_count || 0),
          0
        ),
      }
    })

    return response.json(transformedConcepts)
  }

  async show({ bouncer, params, response }: HttpContext) {
    try {
      const question = await Question.query()
        .where('slug', params.slug)
        .preload('concepts')
        .preload('choices', (query) => {
          query.select(['id', 'choice_text', 'is_correct', 'explanation'])
        })
        .preload('parts', (query) => {
          query.select(['id', 'part_text', 'expected_answer', 'marks'])
        })
        .firstOrFail()

      if (await bouncer.with(QuestionPolicy).denies('view')) {
        return response.forbidden('Cannot view this question')
      }

      return response.json({
        ...question.serialize(),
        choices: question.type === 'mcq' ? question.choices : undefined,
        parts: question.type === 'saq' ? question.parts : undefined,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound('Question not found')
      }
      return response.internalServerError('Error fetching question')
    }
  }

  async store({ bouncer, auth, request, response }: HttpContext) {
    if (await bouncer.with(QuestionPolicy).denies('create')) {
      return response.forbidden('Cannot create questions')
    }

    try {
      const data = await request.validateUsing(createQuestionValidator)

      const question = await db.transaction(async (trx) => {
        const question = await Question.create(
          {
            ...data,
            userId: auth.user!.id,
          },
          { client: trx }
        )

        await question.related('concepts').attach(data.concept_ids, { client: trx })

        if (data.type === 'mcq' && data.choices) {
          await question.related('choices').createMany(data.choices, { client: trx })
        }

        if (data.type === 'saq' && data.parts) {
          await question.related('parts').createMany(data.parts, { client: trx })
        }

        return question
      })

      await question.load('concepts')
      await question.load(question.type === 'mcq' ? 'choices' : 'parts')

      return response.created(question)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  async update({ bouncer, params, request, response }: HttpContext) {
    try {
      const question = await Question.findOrFail(params.id)

      if (await bouncer.with(QuestionPolicy).denies('update', question)) {
        return response.forbidden('Cannot update this question')
      }

      const data = await request.validateUsing(updateQuestionValidator)

      await db.transaction(async (trx) => {
        await question.merge(data).save()

        if (data.concept_ids) {
          await question.related('concepts').sync(data.concept_ids, trx)
        }

        if (data.choices) {
          await question.related('choices').updateOrCreateMany(data.choices, 'id', { client: trx })
        }

        if (data.parts) {
          await question.related('parts').updateOrCreateMany(data.parts, 'id', { client: trx })
        }
      })

      await question.load('concepts')
      await question.load(question.type === 'mcq' ? 'choices' : 'parts')

      return response.json(question)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  async destroy({ bouncer, params, response }: HttpContext) {
    const question = await Question.findOrFail(params.id)

    if (await bouncer.with(QuestionPolicy).denies('delete', question)) {
      return response.forbidden('Cannot delete this question')
    }

    await question.delete()
    return response.noContent()
  }
}
