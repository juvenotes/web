import vine from '@vinejs/vine'

const currentYear = new Date().getFullYear()
const maxYear = currentYear + 7 // Allow up to 7 years in future

export const personalizationValidator = vine.compile(
  vine.object({
    institution_course_id: vine.number().positive(),
    education_level_id: vine.number().positive(),
    graduation_year: vine.number().range([currentYear, maxYear]),
  })
)
