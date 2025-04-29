import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Institution from '#models/institution'
import Course from '#models/course'
import EducationLevel from '#models/education_level'
import InstitutionDto from '#dtos/institution'
import CourseDto from '#dtos/course'
import EducationLevelDto from '#dtos/education_level'
import {
  createInstitutionValidator,
  updateInstitutionValidator,
} from '#validators/institutions/create_institution_validator'
import { updateInstitutionCoursesValidator } from '#validators/institution'

@inject()
export default class InstitutionsController {
  /**
   * Display a listing of institutions
   */
  async index({ inertia, logger, auth }: HttpContext) {
    const context = { controller: 'InstitutionsController', action: 'index' }
    logger.info({ ...context, message: 'Fetching institutions' })

    const institutions = await Institution.query().preload('courses').orderBy('name')

    logger.info({
      ...context,
      userId: auth.user?.id,
      count: institutions.length,
      message: 'Retrieved institutions',
    })

    return inertia.render('manage/institutions/index', {
      institutions: InstitutionDto.fromArray(institutions),
    })
  }

  /**
   * Display the specified institution
   */
  async show({ params, inertia, logger, auth }: HttpContext) {
    const context = {
      controller: 'InstitutionsController',
      action: 'show',
      institutionId: params.id,
    }
    logger.info({ ...context, message: 'Fetching institution details' })

    const institution = await Institution.query()
      .where('id', params.id)
      .preload('courses', (coursesQuery) => {
        coursesQuery.preload('educationLevel')
      })
      .firstOrFail()

    // Get all available courses for assignment to this institution
    const allCourses = await Course.query().preload('educationLevel').orderBy('name')

    // Get all education levels
    const educationLevels = await EducationLevel.query().orderBy('id')

    // Organize courses by education level
    const coursesByLevel: Record<number, { levelName: string; courses: any[] }> = {}

    // First, build the structure with empty courses arrays for each level
    educationLevels.forEach((level) => {
      coursesByLevel[level.id] = {
        levelName: level.name,
        courses: [],
      }
    })

    // Then populate with courses from the institution
    institution.courses.forEach((course) => {
      const levelId = course.educationLevelId
      if (levelId && coursesByLevel[levelId]) {
        coursesByLevel[levelId].courses.push({
          id: course.id,
          name: course.name,
          educationLevelId: levelId,
        })
      }
    })

    // Format available courses to match the component's expected structure
    const availableCourses = allCourses.map((course) => ({
      id: course.id,
      name: course.name,
      educationLevelId: course.educationLevelId,
    }))

    logger.info({
      ...context,
      userId: auth.user?.id,
      institutionName: institution.name,
      coursesCount: institution.courses?.length ?? 0,
      message: 'Retrieved institution details',
    })

    return inertia.render('manage/institutions/show', {
      institution: new InstitutionDto(institution),
      coursesByLevel,
      educationLevels: EducationLevelDto.fromArray(educationLevels),
      availableCourses,
    })
  }

  /**
   * Store a newly created institution
   */
  async store({ request, response, logger, auth, session }: HttpContext) {
    const context = { controller: 'InstitutionsController', action: 'store' }
    logger.info({ ...context, message: 'Creating new institution' })

    const data = await request.validateUsing(createInstitutionValidator)

    try {
      await Institution.create(data)

      logger.info({
        ...context,
        userId: auth.user?.id,
        institutionName: data.name,
        message: 'Institution created successfully',
      })

      session.flash('success', 'Institution created successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to create institution',
      })

      session.flash('error', 'Failed to create institution')
      return response.redirect().back()
    }
  }

  /**
   * Update the specified institution
   */
  async update({ params, request, response, logger, auth, session }: HttpContext) {
    const context = {
      controller: 'InstitutionsController',
      action: 'update',
      institutionId: params.id,
    }
    logger.info({ ...context, message: 'Updating institution' })

    const institution = await Institution.findOrFail(params.id)
    const data = await request.validateUsing(updateInstitutionValidator)

    try {
      institution.merge(data)
      await institution.save()

      logger.info({
        ...context,
        userId: auth.user?.id,
        institutionName: institution.name,
        message: 'Institution updated successfully',
      })

      session.flash('success', 'Institution updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to update institution',
      })

      session.flash('error', 'Failed to update institution')
      return response.redirect().back()
    }
  }

  /**
   * Update the courses associated with the institution
   */
  async updateCourses({ params, request, response, logger, auth, session }: HttpContext) {
    const context = {
      controller: 'InstitutionsController',
      action: 'updateCourses',
      institutionId: params.id,
    }
    logger.info({ ...context, message: 'Updating institution courses' })

    const institution = await Institution.findOrFail(params.id)
    const { courses } = await request.validateUsing(updateInstitutionCoursesValidator)

    try {
      // Extract courseIds from the courses array for syncing
      const courseIds = courses.map((course) => course.courseId)

      await institution.related('courses').sync(courseIds)

      logger.info({
        ...context,
        userId: auth.user?.id,
        institutionName: institution.name,
        courseCount: courses.length,
        message: 'Institution courses updated successfully',
      })

      session.flash('success', 'Courses updated successfully')
      return response.redirect().back()
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to update institution courses',
      })

      session.flash('error', 'Failed to update institution courses')
      return response.redirect().back()
    }
  }

  /**
   * Delete the specified institution
   */
  async destroy({ params, response, logger, auth, session }: HttpContext) {
    const context = {
      controller: 'InstitutionsController',
      action: 'destroy',
      institutionId: params.id,
    }
    logger.info({ ...context, message: 'Deleting institution' })

    const institution = await Institution.findOrFail(params.id)

    try {
      // Remove associations before deletion
      await institution.related('courses').detach()
      await institution.delete()

      logger.info({
        ...context,
        userId: auth.user?.id,
        institutionName: institution.name,
        message: 'Institution deleted successfully',
      })

      session.flash('success', 'Institution deleted successfully')
      return response.redirect().toPath('/manage/institutions')
    } catch (error) {
      logger.error({
        ...context,
        userId: auth.user?.id,
        error,
        message: 'Failed to delete institution',
      })

      session.flash('error', 'Failed to delete institution')
      return response.redirect().back()
    }
  }
}
