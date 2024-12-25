import vine from '@vinejs/vine'

const metadataSchema = vine
  .object({
    timeEstimate: vine.number().optional(),
    difficulty: vine.enum(['beginner', 'intermediate', 'advanced']).optional(),
    tags: vine.array(vine.string()).optional(),
    prerequisites: vine.array(vine.string()).optional(),
    objectives: vine.array(vine.string()).optional(),
    status: vine.enum(['draft', 'review', 'published']).optional(),
    lastReviewed: vine.date().optional(),
    authors: vine.array(vine.string()).optional(),
  })
  .allowUnknownProperties()

export const createConceptValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3),
    parentId: vine.number().optional(),
    knowledgeBlock: vine.string().optional(),
    isTerminal: vine.boolean(),
    level: vine.number(),
    metadata: metadataSchema,
  })
)

export const updateConceptValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).optional(),
    knowledgeBlock: vine.string().optional(),
    isTerminal: vine.boolean().optional(),
    metadata: metadataSchema.optional(),
  })
)
