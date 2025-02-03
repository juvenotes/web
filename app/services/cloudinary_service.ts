import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'

cloudinary.config({
  cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: env.get('CLOUDINARY_API_KEY'),
  api_secret: env.get('CLOUDINARY_API_SECRET'),
})

export class CloudinaryService {
  static async uploadImage(file: string) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        format: 'webp',
        transformation: [{ quality: 'auto' }, { fetch_format: 'webp' }],
      })
      return result.secure_url
    } catch (error) {
      console.error('Cloudinary upload failed:', error)
      throw error
    }
  }
}
