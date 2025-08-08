import vine from '@vinejs/vine'

export const createUserQuizStatValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    quizId: vine.number().positive(),
    questionsAttempted: vine.number().min(0),
    questionsCorrect: vine.number().min(0),
    completionPercentage: vine.number().min(0).max(100),
    score: vine.number().min(0),
    additionalData: vine.record(vine.any()).optional(),
  })
)

export const updateUserQuizStatValidator = vine.compile(
  vine.object({
    questionsAttempted: vine.number().min(0).optional(),
    questionsCorrect: vine.number().min(0).optional(),
    completionPercentage: vine.number().min(0).max(100).optional(),
    score: vine.number().min(0).optional(),
    additionalData: vine.record(vine.any()).optional(),
  })
)
