import vine from '@vinejs/vine'
import { TodayStatus } from '#enums/today_status'

export const createTodayValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    scheduledFor: vine.string().trim(),
    status: vine.enum(Object.values(TodayStatus)).optional(),
  })
)

export const updateTodayValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    scheduledFor: vine.string().trim().optional(),
    status: vine.enum(Object.values(TodayStatus)).optional(),
  })
)
