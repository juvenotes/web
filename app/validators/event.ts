import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const createEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().optional(),
    content: vine.string().optional(),
    eventType: vine.enum([
      'webinar',
      'workshop',
      'conference',
      'exam',
      'seminar',
      'meeting',
      'other',
    ]),
    startDate: vine.date().transform((value) => DateTime.fromJSDate(value)),
    endDate: vine.date().transform((value) => DateTime.fromJSDate(value)),
    registrationDeadline: vine
      .date()
      .optional()
      .transform((value) => (value ? DateTime.fromJSDate(value) : null)),
    venue: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    onlineLink: vine.string().url().optional(),
    isOnline: vine.boolean().optional(),
    isFree: vine.boolean().optional(),
    price: vine.number().positive().optional(),
    currency: vine.string().trim().minLength(3).maxLength(3).optional(),
    maxParticipants: vine.number().positive().optional(),
    imageUrl: vine.string().url().optional(),
  })
)

export const updateEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().optional(),
    content: vine.string().optional(),
    eventType: vine
      .enum(['webinar', 'workshop', 'conference', 'exam', 'seminar', 'meeting', 'other'])
      .optional(),
    status: vine.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
    startDate: vine
      .date()
      .optional()
      .transform((value) => (value ? DateTime.fromJSDate(value) : undefined)),
    endDate: vine
      .date()
      .optional()
      .transform((value) => (value ? DateTime.fromJSDate(value) : undefined)),
    registrationDeadline: vine
      .date()
      .optional()
      .transform((value) => (value ? DateTime.fromJSDate(value) : undefined)),
    venue: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    onlineLink: vine.string().url().optional(),
    isOnline: vine.boolean().optional(),
    isFree: vine.boolean().optional(),
    price: vine.number().positive().optional(),
    currency: vine.string().trim().minLength(3).maxLength(3).optional(),
    maxParticipants: vine.number().positive().optional(),
    imageUrl: vine.string().url().optional(),
  })
)
