import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'

cloudinary.config({
  cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: env.get('CLOUDINARY_API_KEY'),
  api_secret: env.get('CLOUDINARY_API_SECRET'),
  secure: true,
})

export class CloudinaryService {
  static async uploadImage(file: string) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: 'juvenotes/content',
        resource_type: 'auto' as const,
      })

      return result.secure_url
    } catch (error) {
      console.error('Upload failed:', error)
      throw new Error('Failed to upload image')
    }
  }
}
