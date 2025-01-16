import vine from '@vinejs/vine'
import { ExamType } from '#enums/exam_type'

export const createPastPaperValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    year: vine
      .string()
      .trim()
      .regex(/^\d{4}$/),
    examType: vine.enum(Object.values(ExamType)),
    type: vine.enum(['mcq', 'saq', 'mixed']),
    questions: vine
      .array(
        vine.object({
          type: vine.enum(['mcq', 'saq']),
          questionText: vine.string(),
          difficultyLevel: vine.enum(['easy', 'medium', 'hard']),
          choices: vine
            .array(
              vine.object({
                choiceText: vine.string(),
                isCorrect: vine.boolean(),
                explanation: vine.string(),
              })
            )
            .optional(),
          parts: vine
            .array(
              vine.object({
                partText: vine.string(),
                expectedAnswer: vine.string(),
                marks: vine.number(),
              })
            )
            .optional(),
        })
      )
      .optional(),
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
