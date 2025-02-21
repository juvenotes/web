import vine from '@vinejs/vine'
import { InstitutionType } from '#enums/institution_type'

export const createInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    institutionType: vine.enum(Object.values(InstitutionType)),
    branch: vine.string().trim().nullable(),
  })
)

export const updateInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    institutionType: vine.enum(Object.values(InstitutionType)),
    branch: vine.string().trim().nullable(),
    isActive: vine.boolean(),
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
