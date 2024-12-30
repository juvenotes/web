import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
// import { viewQuestions } from '#abilities/main'

export default class IndexController {
  async index({ response }: HttpContext) {
    const rootConcepts = await Concept.query()
      .whereNull('parent_id')
      .select(['id', 'title', 'is_terminal'])
      .preload('children', (query) => {
        query
          .select(['id', 'title', 'parent_id', 'is_terminal'])
          .withCount('questions', (questionsQuery) => {
            questionsQuery
              .whereHas('concepts', (conceptQuery) => {
                conceptQuery.where('is_terminal', true)
              })
              .as('question_count')
          })
      })
      .withCount('questions', (query) => {
        query
          .whereHas('concepts', (conceptQuery) => {
            conceptQuery.where('is_terminal', true)
          })
          .as('question_count')
      })
      .orderBy('level', 'asc')

    const transformedConcepts = rootConcepts.map((concept) => ({
      id: concept.id,
      title: concept.title,
      isTerminal: concept.isTerminal,
      questionCount: concept.children.reduce(
        (sum, child) => sum + (child.isTerminal ? Number(child.$extras.question_count || 0) : 0),
        concept.isTerminal ? Number(concept.$extras.question_count || 0) : 0
      ),
      children: concept.children.map((child) => ({
        id: child.id,
        title: child.title,
        isTerminal: child.isTerminal,
        questionCount: child.isTerminal ? Number(child.$extras.question_count || 0) : 0,
      })),
    }))

    return response.json(transformedConcepts)
  }

  async show({ params, response }: HttpContext) {
    const concept = await Concept.query().where('slug', params.conceptSlug).firstOrFail()

    if (concept.isTerminal) {
      // For terminal concepts, get minimal question data
      await concept.load('questions', (query) => {
        query
          .select(['id', 'type', 'question_text', 'difficulty_level'])
          .preload('concepts', (conceptQuery) => {
            conceptQuery.select(['id', 'title'])
          })
      })

      return response.json({
        id: concept.id,
        title: concept.title,
        isTerminal: true,
        questions: concept.questions,
        questionCount: concept.questions.length,
      })
    }

    // For non-terminal, get recursive question counts
    const children = await Concept.query()
      .where('parent_id', concept.id)
      .select(['id', 'title', 'is_terminal'])
      .withAggregate('questions', (query) => {
        query.count('*').as('total_questions')
      })

    return response.json({
      id: concept.id,
      title: concept.title,
      isTerminal: false,
      children: children.map((child) => ({
        id: child.id,
        title: child.title,
        isTerminal: child.isTerminal,
        questionCount: Number(child.$extras.total_questions || 0),
      })),
      questionCount: children.reduce(
        (sum, child) => sum + Number(child.$extras.total_questions || 0),
        0
      ),
    })
  }
}
