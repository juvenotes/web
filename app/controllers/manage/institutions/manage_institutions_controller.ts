import type { HttpContext } from '@adonisjs/core/http'
import Institution from '#models/institution'
import InstitutionDto from '#dtos/institution'
import {
  createInstitutionValidator,
  updateInstitutionCoursesValidator,
  updateInstitutionValidator,
} from '#validators/institution'
import db from '@adonisjs/lucid/services/db'
import { InstitutionType } from '#enums/institution_type'
import EducationLevel from '#models/education_level'
import Course from '#models/course'

export default class ManageInstitutionsController {
  async index({ inertia, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('InstitutionPolicy').authorize('view')
    const context = {
      controller: 'ManageInstitutionsController',
      action: 'index',
    }

    const institutions = await Institution.query().orderBy('name', 'asc').preload('courses')

    logger.info({
      ...context,
      institutionsCount: institutions.length,
      message: 'Retrieved institutions list',
      userId: auth.user?.id,
    })

    return inertia.render('manage/institutions/index', {
      institutions: InstitutionDto.fromArray(institutions),
    })
  }

  async show({ params, inertia, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('InstitutionPolicy').authorize('view')

    const context = {
      controller: 'ManageInstitutionsController',
      action: 'show',
      institutionId: params.id,
    }

    logger.info({ ...context, message: 'Fetching institution details' })

    // Load institution with its courses and their education levels
    const institution = await Institution.query()
      .where('id', params.id)
      .preload('institutionCourses', (query) => {
        query
          .preload('course', (courseQuery) => {
            courseQuery.select(['id', 'name'])
          })
          .preload('educationLevel', (levelQuery) => {
            levelQuery.select(['id', 'name'])
          })
          .where('is_active', true)
          .orderBy('education_level_id')
      })
      .firstOrFail()

    // Get all education levels
    const educationLevels = await EducationLevel.query().select(['id', 'name']).orderBy('name')

    // Get all available courses with their education levels
    const availableCourses = await Course.query()
      .select(['id', 'name'])
      .preload('educationLevels', (query) => {
        query.select(['id', 'name']).orderBy('name')
      })
      .orderBy('name')

    const institutionDto = new InstitutionDto(institution)

    // Group courses by education level using institutionCourses pivot
    const coursesByLevel = institutionDto.institutionCourses.reduce<
      Record<number, { levelName: string; courses: Array<{ id: number; name: string }> }>
    >((acc, ic) => {
      if (!ic.educationLevel || !ic.course) return acc

      const levelId = ic.educationLevelId
      if (!acc[levelId]) {
        acc[levelId] = {
          levelName: ic.educationLevel.name,
          courses: [],
        }
      }

      acc[levelId].courses.push({
        id: ic.course.id,
        name: ic.course.name,
      })

      return acc
    }, {})

    logger.info({
      ...context,
      institutionName: institutionDto.name,
      coursesCount: institutionDto.institutionCourses.length,
      levelsCount: Object.keys(coursesByLevel).length,
      message: 'Retrieved institution details',
      userId: auth.user?.id,
    })

    return inertia.render('manage/institutions/show', {
      institution: institutionDto,
      coursesByLevel,
      educationLevels,
      availableCourses: availableCourses.map((course) => ({
        id: course.id,
        name: course.name,
        educationLevels: course.educationLevels,
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('manage/institutions/create', {
      institutionTypes: Object.values(InstitutionType),
    })
  }

  async store({ request, response, session, bouncer, logger, auth }: HttpContext) {
    await bouncer.with('InstitutionPolicy').authorize('create')

    const data = await request.validateUsing(createInstitutionValidator)
    const institution = await Institution.create({
      name: data.name,
      institutionType: data.institutionType,
      branch: data.branch,
      isActive: true,
    })

    logger.info({
      controller: 'ManageInstitutionsController',
      action: 'store',
      institutionId: institution.id,
      userId: auth.user?.id,
      message: 'Created new institution',
    })

    session.flash('success', 'Institution created successfully')
    return response.redirect().toPath(`/manage/institutions/${institution.id}`)
  }

  async edit({ params, inertia, bouncer }: HttpContext) {
    const institution = await Institution.findOrFail(params.id)
    await bouncer.with('InstitutionPolicy').authorize('update', institution)

    return inertia.render('manage/institutions/edit', {
      institution: new InstitutionDto(institution),
      institutionTypes: Object.values(InstitutionType),
    })
  }

  async update({ params, request, response, bouncer, session, logger, auth }: HttpContext) {
    const institution = await Institution.findOrFail(params.id)
    await bouncer.with('InstitutionPolicy').authorize('update', institution)

    const data = await request.validateUsing(updateInstitutionValidator)
    await institution.merge(data).save()

    logger.info({
      controller: 'ManageInstitutionsController',
      action: 'update',
      institutionId: institution.id,
      userId: auth.user?.id,
      message: 'Updated institution',
    })

    session.flash('success', 'Institution updated successfully')
    return response.redirect().back()
  }

  async destroy({ params, response, bouncer, session, logger, auth }: HttpContext) {
    const institution = await Institution.findOrFail(params.id)
    await bouncer.with('InstitutionPolicy').authorize('delete', institution)

    await institution.delete()

    logger.info({
      controller: 'ManageInstitutionsController',
      action: 'destroy',
      institutionId: params.id,
      userId: auth.user?.id,
      message: 'Deleted institution',
    })

    session.flash('success', 'Institution deleted successfully')
    return response.redirect().toPath('/manage/institutions')
  }

  async updateCourses({ params, request, response, bouncer, session, logger, auth }: HttpContext) {
    const institution = await Institution.findOrFail(params.id)
    await bouncer.with('InstitutionPolicy').authorize('update', institution)

    const { courses } = await request.validateUsing(updateInstitutionCoursesValidator)

    try {
      await db.transaction(async (trx) => {
        // Delete existing courses
        await institution.related('institutionCourses').query().useTransaction(trx).delete()

        if (courses.length === 0) return

        const now = new Date()
        const coursesToInsert = courses.map((course) => ({
          institution_id: institution.id,
          course_id: course.courseId,
          education_level_id: course.educationLevelId,
          is_active: true,
          created_at: now,
          updated_at: now,
        }))

        // Process in chunks
        const chunkSize = 50
        for (let i = 0; i < coursesToInsert.length; i += chunkSize) {
          const chunk = coursesToInsert.slice(i, i + chunkSize)
          await trx.insertQuery().table('institution_courses').insert(chunk)
        }
      })

      logger.info({
        controller: 'ManageInstitutionsController',
        action: 'updateCourses',
        institutionId: institution.id,
        userId: auth.user?.id,
        coursesCount: courses.length,
        message: 'Updated institution courses',
      })

      session.flash('success', 'Courses updated successfully')
    } catch (error) {
      logger.error({
        controller: 'ManageInstitutionsController',
        action: 'updateCourses',
        institutionId: institution.id,
        error,
        message: 'Failed to update courses',
      })
      session.flash('error', 'Failed to update courses')
    }

    return response.redirect().back()
  }
}
