import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import QuestionDto from '#dtos/question'
import { createPastPaperValidator } from '#validators/past_paper'
import { generateSlug } from '#utils/slug_generator'
import PastPaperPolicy from '#policies/paper_policy'
import { MCQParser, MCQParserError } from '#services/mcq_parser_service'
import db from '@adonisjs/lucid/services/db'
import Question from '#models/question'
import { DifficultyLevel, QuestionType } from '#enums/question_types'
import { promises as fs } from 'node:fs'
import { createQuestionValidator } from '#validators/question'

export default class ManagePastPapersController {
  /**
   * Show root level concepts with their papers
   */
  async index({ inertia, logger, auth }: HttpContext) {
    logger.info('fetching root concepts with papers', {
      userId: auth.user?.id,
      action: 'list_root_concepts_papers',
    })

    const concepts = await Concept.query()
      .where('level', 0)
      .select(['id', 'title', 'slug'])
      .preload('pastPapers', (query) => {
        query.select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
      })

    logger.info('found root concepts with papers', {
      userId: auth.user?.id,
      count: concepts.length,
      papersCount: concepts.reduce((sum, c) => sum + (c.pastPapers?.length ?? 0), 0),
      action: 'list_root_concepts_papers',
    })

    return inertia.render('manage/papers/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show concept details with its papers
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    logger.info('fetching concept with papers', {
      userId: auth.user?.id,
      conceptSlug: params.slug,
      action: 'show_concept_papers',
    })

    const concept = await Concept.query()
      .where('slug', params.slug)
      .preload('pastPapers', (query) => {
        query.select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
      })
      .firstOrFail()

    logger.info('found concept with papers', {
      userId: auth.user?.id,
      conceptId: concept.id,
      conceptTitle: concept.title,
      papersCount: concept.pastPapers?.length ?? 0,
      action: 'show_concept_papers',
    })

    return inertia.render('manage/papers/show', {
      concept: new ConceptDto(concept),
      papers: concept.pastPapers ? PastPaperDto.fromArray(concept.pastPapers) : [],
    })
  }

  /**
   * Show a specific paper for management
   */
  async paper({ params, inertia, logger, auth }: HttpContext) {
    logger.info('fetching paper with questions', {
      userId: auth.user?.id,
      paperSlug: params.paperSlug,
      action: 'show_paper_details',
    })

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

    logger.info('found paper with questions', {
      userId: auth.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      conceptId: paper.concept.id,
      questionsCount: paper.questions?.length ?? 0,
      action: 'show_paper_details',
    })

    return inertia.render('manage/papers/paper', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
      questions: paper.questions ? QuestionDto.fromArray(paper.questions) : [],
    })
  }

  /**
   * Store a new paper
   */
  async store({ request, response, auth, logger }: HttpContext) {
    const data = await request.validateUsing(createPastPaperValidator)

    const concept = await Concept.findOrFail(data.conceptId)
    const paper = await PastPaper.create({
      ...data,
      userId: auth.user!.id,
      slug: generateSlug(),
    })

    logger.info('paper created successfully', {
      userId: auth.user!.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      conceptId: concept.id,
      conceptSlug: concept.slug,
      action: 'create_paper',
    })

    return response.redirect().toPath(`/manage/papers/${concept.slug}/${paper.slug}`)
  }

  async addQuestion({ request, response, params, auth, session }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)
    const data = await request.validateUsing(createQuestionValidator)

    const question = await Question.create({
      questionText: data.questionText,
      type: data.type,
      userId: auth.user!.id,
      pastPaperId: paper.id,
      slug: generateSlug(),
    })

    if (data.type === QuestionType.MCQ && data.choices) {
      await question.related('choices').createMany(data.choices)
    }

    if (data.type === QuestionType.SAQ && data.parts) {
      await question.related('parts').createMany(data.parts)
    }

    session.flash('success', 'Question added successfully')
    return response.redirect().back()
  }

  async uploadQuestions({ request, response, params, auth, logger }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.paperSlug)

    logger.info('attempting to upload questions', {
      userId: auth.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      action: 'upload_questions',
    })

    const file = request.file('file')
    if (!file) {
      return response.badRequest('No file uploaded')
    }

    try {
      // Read file content
      const content = await fs.readFile(file.tmpPath!, 'utf-8')

      // Parse MCQs
      const parsedQuestions = MCQParser.parse(content)

      // Create questions in database
      await db.transaction(async (trx) => {
        for (const parsedQuestion of parsedQuestions) {
          // Create question
          const question = await Question.create(
            {
              userId: auth.user!.id,
              type: QuestionType.MCQ,
              questionText: parsedQuestion.stem,
              difficultyLevel: DifficultyLevel.MEDIUM,
              slug: generateSlug(),
              pastPaperId: paper.id,
            },
            { client: trx }
          )

          // Create choices
          const choices = parsedQuestion.choices.map((choice: string, index: number) => ({
            questionId: question.id,
            choiceText: choice.substring(3).trim(), // Remove "A. " prefix
            isCorrect: `${index + 1}` === parsedQuestion.answer,
            explanation: parsedQuestion.explanation,
          }))

          await question.related('choices').createMany(choices, { client: trx })
        }
      })

      logger.info('questions uploaded successfully', {
        userId: auth.user?.id,
        paperId: paper.id,
        paperSlug: paper.slug,
        questionsCount: parsedQuestions.length,
        action: 'upload_questions',
      })

      return response.redirect().toPath(`/manage/papers/${params.conceptSlug}/${params.paperSlug}`)
    } catch (error) {
      if (error instanceof MCQParserError) {
        logger.error('mcq parsing failed', {
          userId: auth.user?.id,
          paperId: paper.id,
          paperSlug: paper.slug,
          error: error.message,
          line: error.line,
          action: 'upload_questions',
        })
        return response.badRequest(`Parse error on line ${error.line}: ${error.message}`)
      }
      throw error
    }
  }
  /**
   * Delete a paper
   */
  async destroy({ params, response, session, bouncer, logger, auth }: HttpContext) {
    const paper = await PastPaper.findByOrFail('slug', params.slug)

    logger.info('attempting to delete paper', {
      userId: auth?.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      action: 'delete_paper',
    })

    if (await bouncer.with(PastPaperPolicy).denies('delete', paper)) {
      logger.warn('unauthorized paper deletion attempt', {
        userId: auth?.user?.id,
        paperId: paper.id,
        paperSlug: paper.slug,
        action: 'delete_paper',
      })
      return response.forbidden('Cannot delete this paper')
    }

    await paper.delete()

    logger.info('paper deleted successfully', {
      userId: auth?.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      action: 'delete_paper',
    })

    session.flash('success', 'Paper deleted successfully')
    return response.redirect().toPath('/manage/papers')
  }
}
