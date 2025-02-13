import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'

cloudinary.config({
  cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: env.get('CLOUDINARY_API_KEY'),
  api_secret: env.get('CLOUDINARY_API_SECRET'),
})

type UploadContext = {
  folder?: string
  subFolder?: string
}

export class CloudinaryService {
  private static getUploadPath({ folder = 'uploads', subFolder }: UploadContext) {
    return subFolder ? `${folder}/${subFolder}` : folder
  }

  static async uploadImage(file: string, context: UploadContext = {}) {
    try {
      const uploadPath = this.getUploadPath(context)

      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        format: 'webp',
        transformation: [{ quality: 'auto' }, { fetch_format: 'webp' }],
        folder: uploadPath,
      })
      return result.secure_url
    } catch (error) {
      console.error('Cloudinary upload failed:', error)
      throw error
    }
  }
}
