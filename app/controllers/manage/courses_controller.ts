import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { createCourseValidator, updateCourseValidator } from '#validators/courses/course_validator'
import Course from '#models/course'
import EducationLevel from '#models/education_level'
import CourseDto from '#dtos/course'
import EducationLevelDto from '#dtos/education_level'

@inject()
export default class CoursesController {
  /**
   * Display a listing of courses
   */
  async index({ inertia, logger, auth }: HttpContext) {
    const context = { controller: 'CoursesController', action: 'index' }
    logger.info({ ...context, message: 'Fetching courses' })

    const courses = await Course.query()
      .preload('educationLevel')
      .preload('institutions')
      .orderBy('name')

    const educationLevels = await EducationLevel.all()

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: courses.length,
      message: 'Retrieved courses',
    })

    return inertia.render('manage/courses/index', {
      courses: CourseDto.fromArray(courses),
      educationLevels: EducationLevelDto.fromArray(educationLevels),
    })
  }

  /**
   * Display the specified course
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'CoursesController',
      action: 'show',
      courseId: params.id,
    }
    logger.info({ ...context, message: 'Fetching course details' })

    const course = await Course.query()
      .where('id', params.id)
      .preload('educationLevel')
      .preload('institutions')
      .firstOrFail()

    const educationLevels = await EducationLevel.all()

    logger.info({
      ...context,
      userId: auth.user?.id,
      courseName: course.name,
      institutionsCount: course.institutions?.length ?? 0,
      message: 'Retrieved course details',
    })

    return inertia.render('manage/courses/show', {
      course: new CourseDto(course),
      educationLevels: EducationLevelDto.fromArray(educationLevels),
    })
  }

  /**
   * Store a newly created course
   */
  async store({ request, response, logger, auth, session }: HttpContext) {
    const context = { controller: 'CoursesController', action: 'store' }
    logger.info({ ...context, message: 'Creating new course' })

    const data = await request.validateUsing(createCourseValidator)

    // Sanitize course name for consistent capitalization
    data.name = this.sanitizeName(data.name)

    try {
      await Course.create(data)

      logger.info({
        ...context,
        userId: auth.user?.id,
        courseName: data.name,
        message: 'Course created successfully',
      })

      session.flash('success', 'Course created successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to create course',
      })

      session.flash('error', 'Failed to create course')
      return response.redirect().back()
    }
  }

  /**
   * Update the specified course
   */
  async update({ params, request, response, logger, auth, session }: HttpContext) {
    const context = {
      controller: 'CoursesController',
      action: 'update',
      courseId: params.id,
    }
    logger.info({ ...context, message: 'Updating course' })

    const course = await Course.findOrFail(params.id)
    const data = await request.validateUsing(updateCourseValidator)

    // Sanitize course name
    data.name = this.sanitizeName(data.name)

    try {
      course.merge(data)
      await course.save()

      logger.info({
        ...context,
        userId: auth.user?.id,
        courseName: course.name,
        message: 'Course updated successfully',
      })

      session.flash('success', 'Course updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to update course',
      })

      session.flash('error', 'Failed to update course')
      return response.redirect().back()
    }
  }

  /**
   * Delete the specified course
   */
  async destroy({ params, response, logger, auth, session }: HttpContext) {
    const context = {
      controller: 'CoursesController',
      action: 'destroy',
      courseId: params.id,
    }
    logger.info({ ...context, message: 'Deleting course' })

    const course = await Course.findOrFail(params.id)

    try {
      // Remove associations before deletion
      await course.related('institutions').detach()
      await course.delete()

      logger.info({
        ...context,
        userId: auth.user?.id,
        courseName: course.name,
        message: 'Course deleted successfully',
      })

      session.flash('success', 'Course deleted successfully')
      return response.redirect().toPath('/manage/courses')
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to delete course',
      })

      session.flash('error', 'Failed to delete course')
      return response.redirect().back()
    }
  }

  /**
   * Sanitize course name for consistent capitalization
   */
  private sanitizeName(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim()
  }
}
