import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Concept from '#models/concept'
import Question from '#models/question'
import Paper from '#models/past_paper'
import StatsDto from '#dtos/stats'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const [concepts, questions, papers, users, contentfulConcepts] = await Promise.all([
      Concept.query().count('* as total').first(),
      Question.query().count('* as total').first(),
      Paper.query().count('* as total').first(),
      User.query().count('* as total').first(),
      Concept.query()
        .whereNotNull('knowledge_block')
        .where('knowledge_block', '!=', '')
        .count('* as total')
        .first(),
    ])

    const stats = new StatsDto({
      concepts: Number(concepts?.$extras.total) || 0,
      questions: Number(questions?.$extras.total) || 0,
      papers: Number(papers?.$extras.total) || 0,
      users: Number(users?.$extras.total) || 0,
      contentfulConcepts: Number(contentfulConcepts?.$extras.total) || 0,
    })

    return inertia.render('home', { stats })
  }
}
