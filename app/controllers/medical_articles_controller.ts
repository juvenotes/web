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
    const subjectMap: Record<string, { count: number }> = {} // We only need the count now

    for (const article of articles) {
      const content = article.full_data_content as any
      let subjects =
        content?.subjects && Array.isArray(content.subjects) && content.subjects.length > 0
          ? content.subjects
          : [{ name: 'Uncategorized' }]

      for (const subject of subjects) {
        if (!subjectMap[subject.name]) {
          subjectMap[subject.name] = { count: 0 }
        }
        subjectMap[subject.name].count++
      }
    }
    // Sort subjects alphabetically for a better user experience
    const sortedSubjects = Object.keys(subjectMap).sort()
    return inertia.render('library/index', { subjects: sortedSubjects, subjectMap })
  }

  // // Show article by article_id for /library/:article_id
  // public async showByArticleId({ params, inertia }: HttpContext) {
  //   const article = await MedicalArticle.query()
  //     .where('article_id', params.article_id)
  //     .firstOrFail()
  //   return inertia.render('library/show', { article })
  // }

  // Update this method to use the new route structure
  public async showByArticleId({ params, inertia }: HttpContext) {
    const article = await MedicalArticle.query()
      .where('article_id', params.article_id)
      .firstOrFail() // This will throw a 404 if not found, which is correct.
    return inertia.render('library/show', { article })
  }

  public async showBySubject({ params, inertia }: HttpContext) {
    const decodedSubjectName = decodeURIComponent(params.subject)

    // Fetch all articles and filter in JS by subject name
    const allArticles = await MedicalArticle.all()
    const articles = allArticles.filter((article) => {
      const content = article.full_data_content as any
      const subjects =
        content?.subjects && Array.isArray(content.subjects) && content.subjects.length > 0
          ? content.subjects
          : [{ name: 'Uncategorized' }]
      return subjects.some((subject: any) => subject.name === decodedSubjectName)
    })

    // Sort articles by article_name in ascending order
    const sortedArticles = articles.sort((a, b) =>
      (a.article_name || '').localeCompare(b.article_name || '')
    )

    return inertia.render('library/subject', {
      articles: sortedArticles.map((a) => ({
        pk_id: a.pk_id,
        article_id: a.article_id,
        article_name: a.article_name,
        // add any other fields you need in the subject.vue template
      })),
      subjectName: decodedSubjectName,
    })
  }
}
