import { BaseDto } from '@adocasts.com/dto/base'

export default class StatsDto extends BaseDto {
  declare concepts: number
  declare questions: number
  declare papers: number
  declare users: number
  declare contentfulConcepts: number

  constructor(stats: {
    concepts: number
    questions: number
    papers: number
    users?: number
    contentfulConcepts: number
  }) {
    super()
    this.concepts = stats.concepts || 0
    this.questions = stats.questions || 0
    this.papers = stats.papers || 0
    this.users = stats.users || 0
    this.contentfulConcepts = stats.contentfulConcepts || 0
  }
}
