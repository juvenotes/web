import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import ConceptDto from '#dtos/concept'
import {
  createConceptValidator,
  updateConceptValidator,
  updateKnowledgeBlockValidator,
} from '#validators/concept'
import QuestionDto from '#dtos/question'
import { generateSlug } from '#utils/slug_generator'
import ConceptPolicy from '#policies/concept_policy'

export default class ManageConceptsController {
  /**
   * Show root level concepts
   */
  async index({ inertia, bouncer }: HttpContext) {
    await bouncer.with('ConceptPolicy').authorize('view')
    const concepts = await Concept.query()
      .whereNull('parent_id')
      .orderBy('level', 'asc')
      .select(['id', 'title', 'slug', 'is_terminal', 'level'])

    return inertia.render('manage/concepts/index', {
      concepts: ConceptDto.fromArray(concepts),
    })
  }

  /**
   * Show single concept with its children
   */
  async show({ params, inertia, response, bouncer }: HttpContext) {
    await bouncer.with('ConceptPolicy').authorize('view')
    try {
      const concept = await Concept.query()
        .where('slug', params.slug)
        .preload('children', (query) => {
          query.select(['id', 'title', 'slug', 'level', 'is_terminal'])
        })
        .preload('questions', (query) => {
          query
            .select(['id', 'type', 'question_text', 'difficulty_level'])
            .orderBy('questions.created_at', 'desc')
            .preload('choices')
            .preload('parts')
        })
        .firstOrFail()

      return inertia.render('manage/concepts/show', {
        concept: new ConceptDto(concept),
        children: concept.children ? ConceptDto.fromArray(concept.children) : [],
        questions: concept.questions ? QuestionDto.fromArray(concept.questions) : [],
        content: concept.knowledgeBlock,
      })
    } catch (error) {
      return response.redirect().toPath('/manage/concepts')
    }
  }

  async store({ request, auth, response, session, bouncer }: HttpContext) {
    if (await bouncer.with(ConceptPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create concepts')
    }
    const data = await request.validateUsing(createConceptValidator)

    const concept = await Concept.create({
      ...data,
      userId: auth.user!.id,
      slug: generateSlug(),
      level: data.parentId ? 1 : 0,
    })

    session.flash('success', `${concept.title} created successfuly`)
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async update({ request, params, response, session, bouncer }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    if (await bouncer.with(ConceptPolicy).denies('update', concept)) {
      return response.forbidden('Not authorized to update this concept')
    }
    const data = await request.validateUsing(updateConceptValidator)

    await concept
      .merge({
        ...data,
      })
      .save()

    session.flash('success', `${concept.title} updated successfuly`)
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async updateContent({ request, params, response }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)
    const { knowledgeBlock } = await request.validateUsing(updateKnowledgeBlockValidator)

    await concept.merge({ knowledgeBlock }).save()
    return response.redirect().toPath(`/manage/concepts/${concept.slug}`)
  }

  async destroy({ params, response, session, bouncer }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    if (await bouncer.with(ConceptPolicy).denies('delete', concept)) {
      return response.forbidden('Not authorized to delete this concept')
    }

    await concept.delete()
    session.flash('success', 'Concept deleted successfully')
    return response.redirect().toPath('/manage/concepts')
  }
}
