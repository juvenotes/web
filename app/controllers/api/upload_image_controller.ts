import type { HttpContext } from '@adonisjs/core/http'
import { CloudinaryService } from '#services/cloudinary_service'

export default class UploadImageController {
  async store({ request, response }: HttpContext) {
    try {
      const file = request.file('image')
      if (!file) {
        return response.status(400).json({ error: 'No file uploaded' })
      }

      if (!file.isValid) {
        return response.status(400).json({
          error: file.errors,
        })
      }

      const url = await CloudinaryService.uploadImage(file.tmpPath!)
      return url
    } catch (error) {
      console.error('Upload failed:', error)
      return response.status(500).json({
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
