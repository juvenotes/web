import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
// import QuestionDto from '#dtos/question'
import PastPaperDto from '#dtos/past_paper'
import PastPaper from '#models/past_paper'
import QuestionDto from '#dtos/question'

export default class IndexController {
  async index({ inertia, logger }: HttpContext) {
    logger.info('Fetching root level concepts with papers')

    const concepts = await Concept.query()
      .where('level', 0)
      .select(['id', 'title', 'slug', 'level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .orderBy('year', 'desc')
      })

    logger.info('Found %d concepts with papers', concepts.length)

    return inertia.render('papers/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  async show({ params, inertia, logger }: HttpContext) {
    logger.info('Fetching concept papers with slug: %s', params.slug)

    const concept = await Concept.query()
      .where('slug', params.slug)
      .select(['id', 'title', 'slug', 'level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .orderBy('year', 'desc')
          .preload('questions', (questionsQuery) => {
            questionsQuery
              .select(['id', 'type', 'question_text', 'difficulty_level', 'past_paper_id'])
              .preload('choices')
              .preload('parts')
          })
      })
      .firstOrFail()

    logger.info('Found concept: %s with %d papers', concept.title, concept.pastPapers?.length ?? 0)

    return inertia.render('papers/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
      questions: concept.pastPapers?.flatMap((paper) => paper.questions) ?? [],
    })
  }
  async paper({ params, inertia, logger }: HttpContext) {
    logger.info('Fetching paper: %s for concept: %s', params.paperSlug, params.conceptSlug)

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .preload('concept')
      .preload('questions', (query) => {
        query
          .orderBy('id', 'asc')
          .preload('choices', (choicesQuery) => {
            choicesQuery.select(['id', 'choice_text', 'is_correct', 'explanation', 'question_id'])
          })
          .preload('parts', (partsQuery) => {
            partsQuery.select(['id', 'part_text', 'expected_answer', 'marks', 'question_id'])
          })
      })
      .firstOrFail()

    logger.info('Found paper with %d questions', paper.questions?.length ?? 0)

    return inertia.render('papers/paper', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
    })
  }
}
