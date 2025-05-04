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
  async getCourses({ request, response, auth, logger }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const educationLevelId = request.input('educationLevelId')

    if (!educationLevelId) {
      return response.status(400).json({ message: 'Education level ID is required' })
    }

    try {
      logger.info('Loading courses for education level', {
        controller: 'OnboardingController',
        action: 'getCourses',
        userId: auth.user.id,
        educationLevelId,
      })

      // Get courses filtered by education level
      const courses = await Course.query()
        .where('educationLevelId', educationLevelId)
        .preload('educationLevel')

      logger.info('Courses loaded successfully', {
        controller: 'OnboardingController',
        action: 'getCourses',
        userId: auth.user.id,
        educationLevelId,
        coursesCount: courses.length,
        educationLevel: courses[0]?.educationLevel?.name,
      })

      return response.json(CourseDto.fromArray(courses))
    } catch (error) {
      logger.error('Failed to fetch courses', {
        controller: 'OnboardingController',
        action: 'getCourses',
        userId: auth.user.id,
        educationLevelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return response.status(500).json({ message: 'Failed to fetch courses' })
    }
  }

  /**
   * API endpoint to fetch institutions that offer the selected course
   */
  async getInstitutions({ request, response, auth, logger }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const courseId = request.input('courseId')

    if (!courseId) {
      return response.status(400).json({ message: 'Course ID is required' })
    }

    try {
      logger.info('Loading institutions for course', {
        controller: 'OnboardingController',
        action: 'getInstitutions',
        userId: auth.user.id,
        courseId,
      })

      // Get institutions that offer the selected course
      const course = await Course.findOrFail(courseId)
      const institutions = await Institution.query()
        .whereHas('courses', (query) => {
          query.where('courses.id', courseId)
        })
        .orderBy('name')

      logger.info('Institutions loaded successfully', {
        controller: 'OnboardingController',
        action: 'getInstitutions',
        userId: auth.user.id,
        courseId,
        courseName: course.name,
        institutionsCount: institutions.length,
      })

      return response.json(InstitutionDto.fromArray(institutions))
    } catch (error) {
      logger.error('Failed to fetch institutions', {
        controller: 'OnboardingController',
        action: 'getInstitutions',
        userId: auth.user.id,
        courseId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
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

      logger.info('Starting onboarding submission process', {
        controller: 'OnboardingController',
        action: 'store',
        userId: auth.user.id,
        educationLevelId: payload.educationLevelId,
        courseId: payload.courseId,
        institutionId: payload.institutionId,
        graduationYear: payload.graduationYear,
      })

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

        logger.info('Created new institution-course relationship', {
          controller: 'OnboardingController',
          action: 'store',
          userId: auth.user.id,
          institutionCourseId: institutionCourse.id,
        })
      }

      // Create the user enrollment
      const enrollment = await UserEnrollment.create({
        userId: auth.user.id,
        institutionCourseId: institutionCourse.id,
        graduationYear: payload.graduationYear,
      })

      logger.info('User enrollment created successfully', {
        controller: 'OnboardingController',
        action: 'store',
        userId: auth.user.id,
        enrollmentId: enrollment.id,
        institutionCourseId: institutionCourse.id,
        graduationYear: payload.graduationYear,
      })

      session.flash('success', 'Your profile has been updated successfully!')

      // Get the originally intended destination URL
      const returnTo = session.pull(SESSION_KEYS.RETURN_TO, '/learn')
      logger.info('Redirecting after successful onboarding', {
        returnTo,
        userId: auth.user.id,
        controller: 'OnboardingController',
        action: 'store',
      })

      return response.redirect().toPath(returnTo)
    } catch (error) {
      logger.error('Failed to complete onboarding', {
        controller: 'OnboardingController',
        action: 'store',
        userId: auth.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      session.flash('error', 'There was an error saving your profile information.')
      return response.redirect().back()
    }
  }
}
