import vine from '@vinejs/vine'

export const updateRoleValidator = vine.compile(
  vine.object({
    roleId: vine.number().range([1, 4]),
  })
)
