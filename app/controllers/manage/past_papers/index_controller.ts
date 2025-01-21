import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import { createPastPaperValidator } from '#validators/past_paper'
import { generateSlug } from '#utils/slug_generator'
import PastPaperPolicy from '#policies/paper_policy'

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
    logger.info('fetching paper for management', {
      userId: auth.user?.id,
      conceptSlug: params.conceptSlug,
      paperSlug: params.paperSlug,
      action: 'show_paper',
    })

    const paper = await PastPaper.query()
      .where('slug', params.paperSlug)
      .preload('concept')
      .preload('questions')
      .firstOrFail()

    logger.info('paper found for management', {
      userId: auth.user?.id,
      paperId: paper.id,
      paperSlug: paper.slug,
      conceptId: paper.concept.id,
      conceptSlug: paper.concept.slug,
      action: 'show_paper',
    })

    return inertia.render('manage/papers/paper', {
      paper: new PastPaperDto(paper),
      concept: new ConceptDto(paper.concept),
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
