import type { HttpContext } from '@adonisjs/core/http'
import { CloudinaryService } from '#services/cloudinary_service'

export default class UploadImageController {
  async store({ request, response }: HttpContext) {
    // Set JSON content type first
    response.header('Content-Type', 'application/json')

    const file = request.file('image')
    console.log('File received:', { file: !!file })

    if (!file?.tmpPath) {
      return response.json({ error: 'Invalid file' })
    }

    try {
      const url = await CloudinaryService.uploadImage(file.tmpPath)
      console.log('Upload success:', { url })
      return response.json({ url })
    } catch (error) {
      console.error('Upload error:', error)
      return response.json({ error: 'Upload failed' })
    }
  }
}
