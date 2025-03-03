import { BaseModelDto } from '@adocasts.com/dto/base'
import UserMcqResponse from '#models/user_mcq_response'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'

export default class UserMcqResponseDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare questionId: number
  declare selectedOption: string
  declare isCorrect: boolean
  declare createdAt: string
  declare user: UserDto | null
  declare question: QuestionDto | null

  constructor(userMcqResponse?: UserMcqResponse) {
    super()

    if (!userMcqResponse) return
    this.id = userMcqResponse.id
    this.userId = userMcqResponse.userId
    this.questionId = userMcqResponse.questionId
    this.selectedOption = userMcqResponse.selectedOption
    this.isCorrect = userMcqResponse.isCorrect
    // this.createdAt = userMcqResponse.createdAt.toISO()!
    this.user = userMcqResponse.user && new UserDto(userMcqResponse.user)
    this.question = userMcqResponse.question && new QuestionDto(userMcqResponse.question)
  }
}
