import vine from '@vinejs/vine'

export const createConceptValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3),
    parentId: vine.number().optional(),
    knowledgeBlock: vine.string().optional(),
    isTerminal: vine.boolean(),
    level: vine.number(),
  })
)

export const updateConceptValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3),
    knowledgeBlock: vine.string().optional(),
    isTerminal: vine.boolean(),
  })
)
