import vine from '@vinejs/vine'
import { ExamType, PaperType } from '#enums/exam_type'

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
    lastEditedBy: vine
      .object({
        id: vine.number(),
        fullName: vine.string(),
        timestamp: vine.date(),
      })
      .optional(),
  })
  .allowUnknownProperties()

export const createPastPaperValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    year: vine.string().regex(/^\d{4}$/),
    examType: vine.enum(Object.values(ExamType)),
    paperType: vine.enum(Object.values(PaperType)),
    conceptId: vine.number(),
    metadata: metadataSchema.optional(),
  })
)

export const updatePastPaperValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    year: vine
      .string()
      .trim()
      .regex(/^\d{4}$/)
      .optional(),
    examType: vine.enum(Object.values(ExamType)).optional(),
    type: vine.enum(['mcq', 'saq', 'mixed']).optional(),
    metadata: metadataSchema.optional(),
  })
)
