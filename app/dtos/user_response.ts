import { BaseModelDto } from '@adocasts.com/dto/base'
import UserResponse from '#models/user_response'
import UserDto from '#dtos/user'
import QuestionDto from '#dtos/question'

export default class UserResponseDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare questionId: number
  declare selectedOption: string
  declare isCorrect: boolean
  declare createdAt: string
  declare user: UserDto | null
  declare question: QuestionDto | null

  constructor(userResponse?: UserResponse) {
    super()

    if (!userResponse) return
    this.id = userResponse.id
    this.userId = userResponse.userId
    this.questionId = userResponse.questionId
    this.selectedOption = userResponse.selectedOption
    this.isCorrect = userResponse.isCorrect
    // this.createdAt = userResponse.createdAt.toISO()!
    this.user = userResponse.user && new UserDto(userResponse.user)
    this.question = userResponse.question && new QuestionDto(userResponse.question)
  }
}
