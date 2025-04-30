import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import EducationLevel from '#models/education_level'
import Institution from '#models/institution'
import Course from '#models/course'
import InstitutionCourse from '#models/institution_course'
import UserEnrollment from '#models/user_enrollment'
import EducationLevelDto from '#dtos/education_level'
import CourseDto from '#dtos/course'
import InstitutionDto from '#dtos/institution'
import { onboardingValidator } from '#validators/onboarding'
import { SESSION_KEYS } from '#constants/session'

@inject()
export default class OnboardingController {
  /**
   * Display the onboarding form with education levels
   * We'll load only the education levels initially
   */
  async show({ inertia, auth, response, logger, session }: HttpContext) {
    // Check if user is authenticated
    if (!auth.user) {
      logger.info('Unauthenticated user attempting to access onboarding')
      return response.redirect().toPath('/login')
    }

    // Check if user has already completed onboarding
    const existingEnrollment = await UserEnrollment.query().where('userId', auth.user.id).first()

    if (existingEnrollment) {
      logger.info('User has already completed onboarding, redirecting to intended destination', {
        userId: auth.user.id,
      })

      // If they already completed onboarding, take them to their intended destination
      const returnTo = session.get(SESSION_KEYS.RETURN_TO, '/learn')
      return response.redirect().toPath(returnTo)
    }

    // Get all education levels for the first step
    const educationLevels = await EducationLevel.all()

    // Pass the return URL to the frontend so it can be preserved
    const returnUrl = session.get(SESSION_KEYS.RETURN_TO, '/learn')

    return inertia.render('onboarding/index', {
      educationLevels: EducationLevelDto.fromArray(educationLevels),
      returnUrl, // Pass the return URL to the frontend
    })
  }

  /**
   * API endpoint to fetch courses based on education level
   */
  async getCourses({ request, response, auth }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const educationLevelId = request.input('educationLevelId')

    if (!educationLevelId) {
      return response.status(400).json({ message: 'Education level ID is required' })
    }

    try {
      // Get courses filtered by education level
      const courses = await Course.query().where('educationLevelId', educationLevelId)

      return response.json(CourseDto.fromArray(courses))
    } catch {
      return response.status(500).json({ message: 'Failed to fetch courses' })
    }
  }

  /**
   * API endpoint to fetch institutions
   * We fetch all institutions since they're not filtered by course
   */
  async getInstitutions({ response, auth }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    try {
      // Get all institutions
      const institutions = await Institution.all()

      return response.json(InstitutionDto.fromArray(institutions))
    } catch {
      return response.status(500).json({ message: 'Failed to fetch institutions' })
    }
  }

  /**
   * Process the onboarding form submission and create user enrollment
   */
  async store({ request, response, auth, logger, session }: HttpContext) {
    // Check if user is authenticated
    if (!auth.user) {
      logger.info('Unauthenticated user attempting to submit onboarding form')
      return response.redirect().toPath('/login')
    }

    try {
      // Validate request using the validator
      const payload = await request.validateUsing(onboardingValidator)

      // First, check if the course and institution combination exists
      let institutionCourse = await InstitutionCourse.query()
        .where('institutionId', payload.institutionId)
        .where('courseId', payload.courseId)
        .first()

      // If not, create the relationship
      if (!institutionCourse) {
        institutionCourse = await InstitutionCourse.create({
          institutionId: payload.institutionId,
          courseId: payload.courseId,
        })
      }

      // Create the user enrollment
      await UserEnrollment.create({
        userId: auth.user.id,
        institutionCourseId: institutionCourse.id,
        graduationYear: payload.graduationYear,
      })

      logger.info('User enrollment created during onboarding', {
        userId: auth.user.id,
        institutionCourseId: institutionCourse.id,
        graduationYear: payload.graduationYear,
      })

      session.flash('success', 'Your profile has been updated successfully!')

      // Get the originally intended destination URL
      const returnTo = session.pull(SESSION_KEYS.RETURN_TO, '/learn')
      logger.info('Redirecting after onboarding', { returnTo, userId: auth.user.id })

      return response.redirect().toPath(returnTo)
    } catch {
      // Simple error handling that avoids TypeScript issues
      session.flash('error', 'There was an error saving your profile information.')
      return response.redirect().back()
    }
  }
}
