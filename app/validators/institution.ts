import vine from '@vinejs/vine'

export const createInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
  })
)

export const updateInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
  })
)

export const updateInstitutionCoursesValidator = vine.compile(
  vine.object({
    courses: vine.array(
      vine.object({
        courseId: vine.number(),
        educationLevelId: vine.number(),
      })
    ),
  })
)
