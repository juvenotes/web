import { BaseModelDto } from '@adocasts.com/dto/base'
import UserPaperStat from '#models/user_paper_stat'
import UserDto from '#dtos/user'
import PastPaperDto from '#dtos/past_paper'

export default class UserPaperStatsDto extends BaseModelDto {
  declare id: number
  declare userId: number
  declare paperId: number
  declare questionsAttempted: number
  declare questionsCorrect: number
  declare completionPercentage: number
  declare additionalData: Record<string, any>
  declare createdAt: string
  declare updatedAt: string
  declare user: UserDto | null
  declare paper: PastPaperDto | null

  constructor(userPaperStats?: UserPaperStat) {
    super()

    if (!userPaperStats) return
    this.id = userPaperStats.id
    this.userId = userPaperStats.userId
    this.paperId = userPaperStats.paperId
    this.questionsAttempted = userPaperStats.questionsAttempted
    this.questionsCorrect = userPaperStats.questionsCorrect
    this.completionPercentage = userPaperStats.completionPercentage
    this.additionalData = userPaperStats.additionalData
    this.createdAt = userPaperStats.createdAt.toISO()!
    this.updatedAt = userPaperStats.updatedAt.toISO()!
    this.user = userPaperStats.user && new UserDto(userPaperStats.user)
    this.paper = userPaperStats.paper && new PastPaperDto(userPaperStats.paper)
  }
}
