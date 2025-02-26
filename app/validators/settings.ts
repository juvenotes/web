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

export const updateProfileValidator = (userId?: number) =>
  vine.compile(
    vine.object({
      fullName: vine.string().maxLength(254).optional().nullable(),
      username: vine
        .string()
        .regex(/^[a-z0-9-]+$/)
        .minLength(3)
        .maxLength(30)
        .unique(async (db, value) => {
          const query = db.from('users').where('username', value)

          // Exclude the current user when checking uniqueness
          if (userId) {
            query.whereNot('id', userId)
          }

          const match = await query.select('id').first()
          return !match
        }),
    })
  )
