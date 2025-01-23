import vine from '@vinejs/vine'
import { ExamType, PaperType } from '#enums/exam_type'

export const createPastPaperValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    year: vine.string().regex(/^\d{4}$/),
    examType: vine.enum(Object.values(ExamType)),
    paperType: vine.enum(Object.values(PaperType)),
    conceptId: vine.number(),
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
  })
)
