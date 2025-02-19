import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import PastPaper from '#models/past_paper'
import QuestionDto from '#dtos/question'
import { PaperType } from '#enums/exam_type'

export default class IndexController {
  async index({ inertia, logger, auth, bouncer }: HttpContext) {
    const context = { controller: 'PapersIndexController', action: 'index' }
    logger.info({ ...context, message: 'Fetching root level concepts with papers' })

    const concepts = await Concept.query()
      .where('level', 0)
      .select(['id', 'title', 'slug', 'level', 'training_level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
          .whereIn('paper_type', [PaperType.MCQ, PaperType.SAQ, PaperType.MIXED])
          .orderBy('year', 'desc')
      })

    logger.info({
      ...context,
      conceptsCount: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      message: 'Retrieved root level concepts with papers',
      userId: auth.user?.id,
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('papers/index', {
      concepts: ConceptDto.fromArray(concepts),
      canManage,
    })
  }

  async show({ params, inertia, logger, auth, bouncer }: HttpContext) {
    const context = {
      controller: 'PapersIndexController',
      action: 'show',
      conceptSlug: params.slug,
    }
    logger.info({ ...context, message: 'Fetching concept papers' })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .select(['id', 'title', 'slug', 'level'])
      .preload('pastPapers', (query) => {
        query
          .select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug', 'study_level'])
          .whereIn('paper_type', [PaperType.MCQ, PaperType.SAQ, PaperType.MIXED])
          .orderBy('year', 'desc')
        // .preload('questions', (questionsQuery) => {
        //   questionsQuery
        //     .select(['id', 'type', 'question_text', 'difficulty_level', 'past_paper_id'])
        //     .preload('choices')
        //     .preload('parts')
        // })
      })
      .firstOrFail()

    logger.info({
      ...context,
      conceptTitle: concept.title,
      papersCount: concept.pastPapers?.length ?? 0,
      questionsCount:
        concept.pastPapers?.reduce((sum, p) => sum + (p.questions?.length ?? 0), 0) ?? 0,
      message: 'Retrieved concept papers with questions',
      userId: auth.user?.id,
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('papers/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
      questions: concept.pastPapers?.flatMap((paper) => paper.questions) ?? [],
      canManage,
    })
  }

  async view({ params, inertia, logger, auth, bouncer }: HttpContext) {
    const context = {
      controller: 'PapersIndexController',
      action: 'paper',
      conceptSlug: params.conceptSlug,
      paperSlug: params.paperSlug,
    }
    logger.info({ ...context, message: 'Fetching paper with questions' })

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .whereIn('paper_type', [PaperType.MCQ, PaperType.SAQ, PaperType.MIXED])
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

    logger.info({
      ...context,
      paperTitle: paper.title,
      questionsCount: paper.questions?.length ?? 0,
      message: 'Retrieved paper with questions',
      userId: auth.user?.id,
    })

    const canManage = await bouncer.allows('canManage')

    return inertia.render('papers/view', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
      canManage,
    })
  }
}
