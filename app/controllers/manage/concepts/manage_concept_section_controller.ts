import type { HttpContext } from '@adonisjs/core/http'
import ConceptSection from '#models/concept_section'
import {
  createConceptSectionValidator,
  updateConceptSectionValidator,
} from '#validators/concept_section'

export default class ManageConceptSectionController {
  /**
   * List all sections for a concept
   */
  async index({ params, response, logger, auth }: HttpContext) {
    const context = {
      controller: 'ManageConceptSectionController',
      action: 'index',
      conceptId: params.conceptId,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Fetching sections for concept' })

    const sections = await ConceptSection.query()
      .where('concept_id', params.conceptId)
      .orderBy('position', 'asc')

    logger.info({
      ...context,
      count: sections.length,
      message: 'Retrieved concept sections',
    })

    return response.json(sections)
  }

  /**
   * Create a new section
   */
  async store({ request, response, logger, auth }: HttpContext) {
    const data = await request.validateUsing(createConceptSectionValidator)

    const context = {
      controller: 'ManageConceptSectionController',
      action: 'store',
      conceptId: data.conceptId,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Creating new section' })

    // Check if parent section exists and doesn't have content
    if (data.parentSectionId) {
      const parentSection = await ConceptSection.findOrFail(data.parentSectionId)

      if (parentSection.content) {
        return response.badRequest({
          message: 'Cannot add a child section to a section with content',
        })
      }
    }

    // Calculate position if not provided
    if (data.position === undefined) {
      const query = ConceptSection.query().where('concept_id', data.conceptId)

      if (data.parentSectionId) {
        query.where('parent_section_id', data.parentSectionId)
      } else {
        query.whereNull('parent_section_id')
      }

      const maxPositionResult = await query.max('position as maxPosition').first()
      data.position = (maxPositionResult?.$extras.maxPosition || 0) + 1
    }

    const section = await ConceptSection.create(data)

    logger.info({
      ...context,
      sectionId: section.id,
      message: 'Section created successfully',
    })

    return response.created(section)
  }

  /**
   * Show section details
   */
  async show({ params, response }: HttpContext) {
    const section = await ConceptSection.query()
      .where('id', params.id)
      .preload('childSections')
      .firstOrFail()

    return response.json(section)
  }

  /**
   * Update a section
   */
  async update({ params, request, response, logger, auth }: HttpContext) {
    const section = await ConceptSection.query()
      .where('id', params.id)
      .preload('childSections')
      .firstOrFail()

    const data = await request.validateUsing(updateConceptSectionValidator)

    const context = {
      controller: 'ManageConceptSectionController',
      action: 'update',
      sectionId: section.id,
      userId: auth.user?.id,
    }

    logger.info({ ...context, message: 'Updating section' })

    // Check if trying to add content to a section with children
    if (data.content && section.childSections.length > 0) {
      return response.badRequest({
        message: 'Cannot add content to a section with child sections',
      })
    }

    // If changing parent, check if new parent has content
    if (data.parentSectionId && data.parentSectionId !== section.parentSectionId) {
      const newParent = await ConceptSection.findOrFail(data.parentSectionId)

      if (newParent.content) {
        return response.badRequest({
          message: 'Cannot move under a section with content',
        })
      }
    }

    await section.merge(data).save()

    logger.info({
      ...context,
      message: 'Section updated successfully',
    })

    return response.json(section)
  }

  /**
   * Delete a section and optionally its children
   */
  async destroy({ params, request, response, logger, auth }: HttpContext) {
    const section = await ConceptSection.query()
      .where('id', params.id)
      .preload('childSections')
      .firstOrFail()

    const deleteChildren = request.input('deleteChildren', false)

    const context = {
      controller: 'ManageConceptSectionController',
      action: 'destroy',
      sectionId: section.id,
      userId: auth.user?.id,
    }

    logger.info({
      ...context,
      deleteChildren,
      message: 'Deleting section',
    })

    if (section.childSections.length > 0 && !deleteChildren) {
      return response.badRequest({
        message: 'Cannot delete section with children without setting deleteChildren=true',
      })
    }

    await section.delete()

    // Reorder remaining sections
    await this.reorderSections(section.conceptId, section.parentSectionId)

    logger.info({
      ...context,
      message: 'Section deleted successfully',
    })

    return response.noContent()
  }

  /**
   * Helper to reorder sections after deletion
   */
  private async reorderSections(conceptId: number, parentSectionId: number | null) {
    const query = ConceptSection.query().where('concept_id', conceptId)

    if (parentSectionId) {
      query.where('parent_section_id', parentSectionId)
    } else {
      query.whereNull('parent_section_id')
    }

    const sections = await query.orderBy('position', 'asc')

    // Update positions to be sequential
    for (const [i, section] of sections.entries()) {
      await section.merge({ position: i + 1 }).save()
    }
  }
}
