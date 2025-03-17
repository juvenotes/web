import { BaseModelDto } from '@adocasts.com/dto/base'
import UserSpotResponse from '#models/user_spot_response'
import { ResponseStatus } from '#enums/response_status'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'
import SpotStationDto from '#dtos/spot_station'

export default class UserSpotResponseDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare questionId: number
  declare stationId: number
  declare action: string
  declare status: ResponseStatus
  declare originalStationText: string | null
  declare createdAt: string
  declare user: UserDto | null
  declare question: QuestionDto | null
  declare station: SpotStationDto | null

  constructor(userSpotResponse?: UserSpotResponse) {
    super()

    if (!userSpotResponse) return
    this.id = userSpotResponse.id
    this.userId = userSpotResponse.userId
    this.questionId = userSpotResponse.questionId
    this.stationId = userSpotResponse.stationId
    this.action = userSpotResponse.action
    this.status = userSpotResponse.status
    this.originalStationText = userSpotResponse.originalStationText
    this.createdAt = userSpotResponse.createdAt.toISO()!
    this.user = userSpotResponse.user && new UserDto(userSpotResponse.user)
    this.question = userSpotResponse.question && new QuestionDto(userSpotResponse.question)
    this.station = userSpotResponse.station && new SpotStationDto(userSpotResponse.station)
  }
}
