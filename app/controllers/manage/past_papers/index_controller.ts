import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import { createPastPaperValidator } from '#validators/past_paper'
import { generateSlug } from '#utils/slug_generator'
import PastPaperPolicy from '#policies/paper_policy'

export default class ManagePastPapersController {
  async index({ inertia, bouncer, logger, auth }: HttpContext) {
    await bouncer.with(PastPaperPolicy).authorize('view')

    const concepts = await Concept.query()
      .where('level', 0)
      .select(['id', 'title', 'slug'])
      .preload('pastPapers', (query) => {
        query.select(['id', 'title', 'year', 'exam_type', 'paper_type', 'slug'])
      })

    return inertia.render('manage/papers/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  async create({ params, inertia, bouncer }: HttpContext) {
    await bouncer.with(PastPaperPolicy).authorize('create')

    const concept = await Concept.findByOrFail('slug', params.conceptSlug)

    return inertia.render('manage/papers/create', {
      concept: new ConceptDto(concept),
    })
  }

  async store({ request, response, auth, bouncer, logger }: HttpContext) {
    await bouncer.with(PastPaperPolicy).authorize('create')

    const data = await request.validateUsing(createPastPaperValidator)

    const paper = await PastPaper.create({
      ...data,
      userId: auth.user!.id,
      slug: generateSlug(),
    })

    logger.info('paper created', {
      paperId: paper.id,
      paperSlug: paper.slug,
      userId: auth.user!.id,
    })

    return response.redirect().toPath(`/manage/papers/${paper.slug}`)
  }
}
