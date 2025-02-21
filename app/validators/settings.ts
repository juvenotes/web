import vine from '@vinejs/vine'
import { emailRule } from './auth.js'

export const updateEmailValidator = vine.compile(
  vine.object({
    email: emailRule().unique(async (db, value) => {
      const match = await db.from('users').where('email', value).select('id').first()
      return !match
    }),
    password: vine.string(),
  })
)

export const updateProfileValidator = (userId: number) => {
  return vine.compile(
    vine.object({
      fullName: vine.string().maxLength(254).optional().nullable(),
      username: vine
        .string()
        .minLength(3)
        .maxLength(30)
        .regex(/^[a-z0-9-]+$/)
        .unique(async (db, value) => {
          const exists = await db
            .from('users')
            .where('username', value)
            .whereNot('id', userId)
            .first()
          return !exists
        }),
    })
  )
}
