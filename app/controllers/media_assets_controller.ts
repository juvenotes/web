import type { HttpContext } from '@adonisjs/core/http'
import MediaAsset from '#models/media_asset'

export default class MediaAssetsController {
  public async show({ params, response }: HttpContext) {
    // 1. Get the hintId from the route parameters
    const hintId = params.hintId

    // 2. Query the database for the media asset using the Lucid model
    const mediaAsset = await MediaAsset.findBy('hintId', hintId)

    // 3. Handle the case where no media is found
    if (!mediaAsset || !mediaAsset.cloudinaryUrl) {
      // Return a 404 Not Found response, will make this to return article page in future
      return response.notFound({ error: 'Media not found for this hint ID' })
    }

    // 4. Return the Cloudinary URL in a JSON response
    // The .json() method automatically sets the right content-type header
    return response.json({
      url: mediaAsset.cloudinaryUrl,
    })
  }
}
