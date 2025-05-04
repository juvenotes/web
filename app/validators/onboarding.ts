import vine from '@vinejs/vine'

export const onboardingValidator = vine.compile(
  vine.object({
    educationLevelId: vine.number().withoutDecimals().positive(),
    courseId: vine.number().withoutDecimals().positive(),
    institutionId: vine.number().withoutDecimals().positive(),
    graduationYear: vine.number().withoutDecimals().positive(),
  })
)
