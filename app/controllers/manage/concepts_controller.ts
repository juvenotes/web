import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import { createConceptValidator, updateConceptValidator } from '#validators/concept'

export default class ConceptsController {
  async index({ response }: HttpContext) {
    const concepts = await Concept.query()
      .preload('children')
      .whereNull('parent_id')
      .orderBy('level', 'asc')

    return response.json(concepts)
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createConceptValidator)
      const concept = await Concept.create(data)

      await concept.load('children')
      return response.created(concept)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  async show({ params, response }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)
    await concept.load('children')

    // if (inertia.isInertia) {
    //   // Render page with EditorJS
    //   return inertia.render('concepts/show', {
    //     concept,
    //     isEditable: concept.isTerminal,
    //   })
    // }

    return response.json(concept)
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const concept = await Concept.findByOrFail('slug', params.slug)
      const data = await request.validateUsing(updateConceptValidator)

      await concept.merge(data).save()
      await concept.load('children')
      return response.json(concept)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  //   async updateContent({ params, request, response }: HttpContext) {
  //     try {
  //       const concept = await Concept.findByOrFail('slug', params.slug)

  //       if (!concept.isTerminal) {
  //         return response.badRequest({
  //           message: 'Only terminal concepts can have content',
  //         })
  //       }

  //       const { content } = await request.validateUsing(updateContentValidator)
  //       await concept.merge({ knowledgeBlock: content }).save()

  //       return response.json(concept)
  //     } catch (error) {
  //       return response.badRequest(error.messages)
  //     }
  //   }

  async destroy({ params, response }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)
    await concept.delete()

    return response.noContent()
  }
}
