import vine from '@vinejs/vine'
import { InstitutionType } from '#enums/institution_type'

/**
 * Validator for creating a new institution
 */
export const createInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    institutionType: vine.enum(Object.values(InstitutionType)).optional(),
    branch: vine.string().trim().maxLength(255).optional(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator for updating an existing institution
 */
export const updateInstitutionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    institutionType: vine.enum(Object.values(InstitutionType)).optional(),
    branch: vine.string().trim().maxLength(255).optional(),
    isActive: vine.boolean().optional(),
  })
)
