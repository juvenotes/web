import { HttpContext } from '@adonisjs/core/http'
// import User from 'App/Models/User'

export default class StudyTimeController {
  async store({ request, auth }: HttpContext) {
    const user = auth.user!
    const { time } = request.only(['time'])

    await user
      .merge({
        total_study_time: user.total_study_time + time,
      })
      .save()

    return { success: true }
  }
}
