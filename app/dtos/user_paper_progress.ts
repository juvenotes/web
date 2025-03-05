import { BaseModelDto } from '@adocasts.com/dto/base'
import UserPaperProgress from '#models/user_paper_progress'
import UserDto from '#dtos/user'
import PastPaperDto from '#dtos/past_paper'
import QuestionDto from '#dtos/question'

export default class UserPaperProgressDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare paperId: number
  declare lastQuestionId: number | null
  declare lastVisitedAt: string
  declare attemptCount: number
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare paper: PastPaperDto | null
  declare lastQuestion: QuestionDto | null

  constructor(userPaperProgress?: UserPaperProgress) {
    super()

    if (!userPaperProgress) return
    this.id = userPaperProgress.id
    this.userId = userPaperProgress.userId
    this.paperId = userPaperProgress.paperId
    this.lastQuestionId = userPaperProgress.lastQuestionId
    // this.lastVisitedAt = userPaperProgress.lastVisitedAt.toISO()!
    this.attemptCount = userPaperProgress.attemptCount
    // this.createdAt = userPaperProgress.createdAt.toISO()!
    // this.updatedAt = userPaperProgress.updatedAt.toISO()!
    this.user = userPaperProgress.user && new UserDto(userPaperProgress.user)
    this.paper = userPaperProgress.paper && new PastPaperDto(userPaperProgress.paper)
    this.lastQuestion =
      userPaperProgress.lastQuestion && new QuestionDto(userPaperProgress.lastQuestion)
  }
}
