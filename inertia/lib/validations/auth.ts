import * as z from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional(),
})

export type RegisterValues = z.infer<typeof registerSchema>
