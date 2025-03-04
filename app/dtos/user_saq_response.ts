import { BaseModelDto } from '@adocasts.com/dto/base'
import UserSaqResponse from '#models/user_saq_response'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'
import SaqPartDto from '#dtos/saq_part'

export default class UserSaqResponseDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare questionId: number
  declare partId: number
  declare answerText: string // This will just store viewed
  declare createdAt: string
  declare user: UserDto | null
  declare question: QuestionDto | null
  declare part: SaqPartDto | null

  constructor(userSaqResponse?: UserSaqResponse) {
    super()

    if (!userSaqResponse) return
    this.id = userSaqResponse.id
    this.userId = userSaqResponse.userId
    this.questionId = userSaqResponse.questionId
    this.partId = userSaqResponse.partId
    this.answerText = userSaqResponse.answerText
    this.createdAt = userSaqResponse.createdAt.toISO()!
    this.user = userSaqResponse.user && new UserDto(userSaqResponse.user)
    this.question = userSaqResponse.question && new QuestionDto(userSaqResponse.question)
    this.part = userSaqResponse.part && new SaqPartDto(userSaqResponse.part)
  }
}
