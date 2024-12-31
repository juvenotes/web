import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import { createConceptValidator, updateConceptValidator } from '#validators/concept'
import ConceptPolicy from '#policies/concept_policy'
// import axios from 'axios'

export default class ManageConceptsController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(ConceptPolicy).denies('view')) {
      return response.forbidden('Cannot view this page')
    }

    const concepts = await Concept.query()
      .preload('children')
      .whereNull('parent_id')
      .orderBy('level', 'asc')

    return response.json(concepts)
  }

  async store({ bouncer, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createConceptValidator)
      const concept = await Concept.create(data)

      if (await bouncer.with(ConceptPolicy).denies('create', concept)) {
        return response.forbidden('Cannot create this concept')
      }

      await concept.load('children')
      return response.created(concept)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  // async show({ bouncer, inertia, request, response }: HttpContext) {
  //   if (await bouncer.with(ConceptPolicy).denies('view')) {
  //     return response.forbidden('Cannot view this page')
  //   }

  //   const concept = await Concept.findByOrFail('slug', params.slug)
  //   await concept.load('children')

  //   // if (request.inertia()) {
  //   //   return inertia.render('manage/concepts/show', {
  //   //     concept,
  //   //     isEditable: concept.isTerminal,
  //   //   })
  //   // }

  //   return inertia.render('manage/concepts/show', concept)
  // }

  // async update({ bouncer, params, request, response }: HttpContext) {
  //   try {
  //     const concept = await Concept.findByOrFail('slug', params.slug)
  //     const data = await request.validateUsing(updateConceptValidator)

  //     if (await bouncer.with(ConceptPolicy).denies('update', concept)) {
  //       return response.forbidden('Cannot update this concept')
  //     }

  //     await concept.merge(data).save()
  //     await concept.load('children')
  //     return response.json(concept)
  //   } catch (error) {
  //     return response.badRequest(error.messages)
  //   }
  // }

  // // This controller is specific for a knowledge block

  // async updateContent({ bouncer, params, request, response }: HttpContext) {
  //   try {
  //     const concept = await Concept.findByOrFail('slug', params.slug)

  //     if (await bouncer.with(ConceptPolicy).denies('update', concept)) {
  //       return response.forbidden('Cannot update this concept')
  //     }

  //     if (!concept.isTerminal) {
  //       return response.badRequest({
  //         message: 'Only terminal concepts can have content',
  //       })
  //     }

  //     const file = request.file('content')
  //     if (!file) {
  //       return response.badRequest({
  //         message: 'You need to upload a file',
  //       })
  //     }

  //     // Create form data
  //     const formData = new FormData()
  //     formData.append('file', file.toJSON())

  //     // Send to FastAPI
  //     const convertResponse = await axios.post('http://127.0.0.1:8000/convert', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     })

  //     // Store converted content
  //     await concept
  //       .merge({
  //         knowledgeBlock: convertResponse.data.content,
  //       })
  //       .save()

  //     return response.json(concept)
  //   } catch (error) {
  //     console.error('Conversion error:', error)
  //     return response.badRequest({
  //       message: 'Failed to process content',
  //       error: error.message,
  //     })
  //   }
  // }

  async destroy({ bouncer, params, response }: HttpContext) {
    const concept = await Concept.findByOrFail('slug', params.slug)

    if (await bouncer.with(ConceptPolicy).denies('update', concept)) {
      return response.forbidden('Cannot update this concept')
    }
    await concept.delete()

    return response.noContent()
  }
}
