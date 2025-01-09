import type { HttpContext } from '@adonisjs/core/http'
import Concept from '#models/concept'
import Question from '#models/question'
import PastPaper from '#models/past_paper'
import StatsDto from '#dtos/stats'

export default class ManagementDashboardController {
  async index({ inertia }: HttpContext) {
    const [concepts, questions, papers] = await Promise.all([
      Concept.query().count('* as total').first(),
      Question.query().count('* as total').first(),
      PastPaper.query().count('* as total').first(),
    ])

    const stats = new StatsDto({
      concepts: Number(concepts?.$extras.total) || 0,
      questions: Number(questions?.$extras.total) || 0,
      papers: Number(papers?.$extras.total) || 0,
    })

    return inertia.render('manage/dashboard', { stats })
  }
}
