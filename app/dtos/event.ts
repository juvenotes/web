import { BaseModelDto } from '@adocasts.com/dto/base'
import Event from '#models/event'
import UserDto from '#dtos/user'
import EventQuizDto from '#dtos/event_quiz'

export default class EventDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare title: string
  declare slug: string
  declare description: string | null
  declare content: string | null
  declare eventType: string
  declare status: string
  declare startDate: string
  declare endDate: string
  declare registrationDeadline: string | null
  declare venue: string | null
  declare address: string | null
  declare onlineLink: string | null
  declare isOnline: boolean
  declare isFree: boolean
  declare price: number | null
  declare currency: string
  declare maxParticipants: number | null
  declare currentParticipants: number
  declare imageUrl: string | null
  declare deletedAt: string | null
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare quizzes: EventQuizDto[]

  constructor(event?: Event) {
    super()

    if (!event) return
    this.id = event.id
    this.userId = event.userId
    this.title = event.title
    this.slug = event.slug
    this.description = event.description
    this.content = event.content
    this.eventType = event.eventType
    this.status = event.status
    this.startDate = event.startDate.toISO()!
    this.endDate = event.endDate.toISO()!
    this.registrationDeadline = event.registrationDeadline?.toISO()!
    this.venue = event.venue
    this.address = event.address
    this.onlineLink = event.onlineLink
    this.isOnline = event.isOnline
    this.isFree = event.isFree
    this.price = event.price
    this.currency = event.currency
    this.maxParticipants = event.maxParticipants
    this.currentParticipants = event.currentParticipants
    this.imageUrl = event.imageUrl
    this.deletedAt = event.deletedAt?.toISO()!
    this.createdAt = event.createdAt.toISO()!
    this.updatedAt = event.updatedAt.toISO()!
    this.user = event.user && new UserDto(event.user)
    this.quizzes = EventQuizDto.fromArray(event.quizzes)
  }
}
