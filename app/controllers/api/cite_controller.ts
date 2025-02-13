import type { HttpContext } from '@adonisjs/core/http'
import { Cite } from '@citation-js/core'
import '@citation-js/plugin-bibtex'
import '@citation-js/plugin-doi'
import '@citation-js/plugin-csl'

interface WebsiteInput {
  url: string
  title: string
  author?: string
  year?: string
  publisher?: string
  accessDate: string
}

interface BookInput {
  title: string
  author: string
  year: string
  publisher: string
  isbn?: string
  edition?: string
}

export default class CitationController {
  async store({ request, response, logger }: HttpContext) {
    const context = {
      controller: 'CitationController',
      action: 'store',
    }

    try {
      logger.info({ ...context, message: 'Processing citation request' })

      const { source, type } = request.body()

      if (!source) {
        logger.warn({ ...context, message: 'No citation source provided' })
        return response.status(400).json({ error: 'No citation source provided' })
      }

      logger.info({ ...context, type, message: 'Generating citation' })

      let input
      switch (type) {
        case 'doi':
          input = source.startsWith('https://doi.org/') ? source : `https://doi.org/${source}`
          break
        case 'website':
          const websiteData = source as WebsiteInput
          input = {
            type: 'webpage',
            title: websiteData.title,
            author: websiteData.author ? [{ family: websiteData.author }] : undefined,
            issued: websiteData.year ? { 'date-parts': [[websiteData.year]] } : undefined,
            URL: websiteData.url,
            accessed: { 'date-parts': [[new Date(websiteData.accessDate).getFullYear()]] },
            publisher: websiteData.publisher,
          }
          break
        case 'book':
          const bookData = source as BookInput
          input = {
            type: 'book',
            title: bookData.title,
            author: [{ family: bookData.author }],
            issued: { 'date-parts': [[bookData.year]] },
            publisher: bookData.publisher,
            ISBN: bookData.isbn,
            edition: bookData.edition,
          }
          break
        default:
          input = source
      }

      logger.info({
        ...context,
        type,
        input,
        message: 'Attempting citation with input',
      })

      const cite = await Cite.async(input)

      const result = {
        inText: cite.format('citation', {
          format: 'text',
          template: 'apa',
          lang: 'en-US',
        }),
        bibliography: cite.format('bibliography', {
          format: 'text',
          template: 'apa',
          lang: 'en-US',
        }),
        raw: cite.format('data', { format: 'object' }),
      }

      logger.info({
        ...context,
        type,
        input,
        message: 'Citation generated successfully',
      })

      return response.json(result)
    } catch (error) {
      logger.error({
        ...context,
        error,
        message: 'Failed to generate citation',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })

      return response.status(500).json({
        error: 'Citation generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
