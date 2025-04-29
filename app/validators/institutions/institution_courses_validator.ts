import vine from '@vinejs/vine'

/**
 * Validator for managing courses in an institution
 */
export const institutionCoursesValidator = vine.compile(
  vine.object({
    courses: vine.array(
      vine.object({
        courseId: vine.number().positive(),
        educationLevelId: vine.number().positive(),
      })
    ),
  })
)
