import vine from '@vinejs/vine'

export const createEventQuizValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().optional(),
    status: vine.enum(['draft', 'published']).optional(),
    durationMinutes: vine.number().optional(),
    hasTimer: vine.boolean().optional(),
    autoSubmit: vine.boolean().optional(),
    lockdownMode: vine.boolean().optional(),
    quizMode: vine.enum(['standard', 'timed_lockdown']).optional(),
  })
)

export const updateEventQuizValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().optional(),
    status: vine.enum(['draft', 'published']).optional(),
    durationMinutes: vine.number().optional(),
    hasTimer: vine.boolean().optional(),
    autoSubmit: vine.boolean().optional(),
    lockdownMode: vine.boolean().optional(),
    quizMode: vine.enum(['standard', 'timed_lockdown']).optional(),
    timeLimit: vine.boolean().optional(),
    startTime: vine.date().optional(),
    endTime: vine.date().optional(),
  })
)
