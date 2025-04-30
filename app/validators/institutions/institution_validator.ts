import vine from '@vinejs/vine'

/**
 * Validator for creating a new institution
 */
export const createInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
  })
)

/**
 * Validator for updating an existing institution
 */
export const updateInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
  })
)

/**
 * Validator for updating the courses associated with an institution
 */
export const institutionCoursesValidator = vine.compile(
  vine.object({
    courseIds: vine.array(vine.number()),
  })
)
