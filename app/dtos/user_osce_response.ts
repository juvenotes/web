import { BaseModelDto } from '@adocasts.com/dto/base'
import UserOsceResponse from '#models/user_osce_response'
import { ResponseStatus } from '#enums/response_status'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'
import StationDto from '#dtos/station'

export default class UserOsceResponseDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare questionId: number
  declare stationId: number
  declare action: string // viewed or other actions
  declare status: ResponseStatus
  declare originalStationText: string | null
  declare createdAt: string
  declare user: UserDto | null
  declare question: QuestionDto | null
  declare station: StationDto | null

  constructor(userOsceResponse?: UserOsceResponse) {
    super()

    if (!userOsceResponse) return
    this.id = userOsceResponse.id
    this.userId = userOsceResponse.userId
    this.questionId = userOsceResponse.questionId
    this.stationId = userOsceResponse.stationId
    this.action = userOsceResponse.action
    this.status = userOsceResponse.status
    this.originalStationText = userOsceResponse.originalStationText
    this.createdAt = userOsceResponse.createdAt?.toISO() || ''
    this.user = userOsceResponse.user && new UserDto(userOsceResponse.user)
    this.question = userOsceResponse.question && new QuestionDto(userOsceResponse.question)
    this.station = userOsceResponse.station && new StationDto(userOsceResponse.station)
  }
}
