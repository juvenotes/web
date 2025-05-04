import vine from '@vinejs/vine'

/**
 * Validator for creating a new course
 */
export const createCourseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    educationLevelId: vine.number(),
  })
)

/**
 * Validator for updating an existing course
 */
export const updateCourseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    educationLevelId: vine.number(),
  })
)
