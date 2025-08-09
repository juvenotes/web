import vine from '@vinejs/vine'

export const createEventQuizValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().optional(),
    status: vine.enum(['draft', 'published']).optional(),
  })
)

export const updateEventQuizValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().optional(),
    status: vine.enum(['draft', 'published']).optional(),
  })
)
