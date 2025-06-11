import type { HttpContext } from '@adonisjs/core/http'
import MedicalArticle from '#models/medical_article'

export default class MedicalArticleController {
  // List all articles
  public async index({}: HttpContext) {
    return await MedicalArticle.all()
  }

  // Show a single article
  public async show({ params }: HttpContext) {
    return await MedicalArticle.findOrFail(params.id)
  }

  // Create a new article
  public async store({ request }: HttpContext) {
    const data = request.only([
      'original_filename',
      'article_id',
      'article_name',
      'library_id',
      'keywords',
      'full_data_content',
    ])
    return await MedicalArticle.create(data)
  }

  // Update an article
  public async update({ params, request }: HttpContext) {
    const article = await MedicalArticle.findOrFail(params.id)
    const data = request.only([
      'original_filename',
      'article_id',
      'article_name',
      'library_id',
      'keywords',
      'full_data_content',
    ])
    article.merge(data)
    await article.save()
    return article
  }

  // Delete an article
  public async destroy({ params }: HttpContext) {
    const article = await MedicalArticle.findOrFail(params.id)
    await article.delete()
    return { message: 'Deleted successfully' }
  }

  public async library({ inertia }: HttpContext) {
    const articles = await MedicalArticle.all()
    const subjectMap: Record<string, typeof articles> = {}
    for (const article of articles) {
      let subjects: any[] = []
      // Try to safely access subjects from full_data_content
      const content = article.full_data_content as any
      if (content && Array.isArray(content.subjects) && content.subjects.length > 0) {
        subjects = content.subjects
      } else {
        subjects = [{ name: 'Uncategorized' }]
      }
      for (const subject of subjects) {
        if (!subjectMap[subject.name]) subjectMap[subject.name] = []
        subjectMap[subject.name].push(article)
      }
    }
    return inertia.render('library/index', { subjectMap })
  }

  // Show article by article_id for /library/:article_id
  public async showByArticleId({ params, inertia }: HttpContext) {
    const article = await MedicalArticle.query()
      .where('article_id', params.article_id)
      .firstOrFail()
    return inertia.render('library/show', { article })
  }
}
