import vine from '@vinejs/vine'

export const createConceptSectionValidator = vine.compile(
  vine.object({
    conceptId: vine.number(),
    parentSectionId: vine.number().nullable().optional(),
    title: vine.string().trim().minLength(2).maxLength(255),
    position: vine.number(),
    content: vine.string().nullable().optional(),
  })
)

export const updateConceptSectionValidator = vine.compile(
  vine.object({
    conceptId: vine.number().optional(),
    parentSectionId: vine.number().nullable().optional(),
    title: vine.string().trim().minLength(2).maxLength(255).optional(),
    position: vine.number().optional(),
    content: vine.string().nullable().optional(),
  })
)
