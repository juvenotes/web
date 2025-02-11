import type { HttpContext } from '@adonisjs/core/http'
import Institution from '#models/institution'
import InstitutionDto from '#dtos/institution'

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
        query.preload('course').preload('educationLevel').orderBy('education_level_id')
      })
      .firstOrFail()

    const institutionDto = new InstitutionDto(institution)

    // Group courses by education level using institutionCourses pivot
    const coursesByLevel = institutionDto.institutionCourses.reduce<
      Record<
        number,
        {
          levelName: string
          courses: Array<{ id: number; name: string }>
        }
      >
    >((acc, ic) => {
      if (!ic.educationLevel || !ic.course) return acc

      const levelId = ic.educationLevelId
      if (!acc[levelId]) {
        acc[levelId] = {
          levelName: ic.educationLevel.name,
          courses: [],
        }
      }

      // Only add active courses
      if (ic.isActive) {
        acc[levelId].courses.push({
          id: ic.course.id,
          name: ic.course.name,
        })
      }

      return acc
    }, {})

    logger.info({
      ...context,
      institutionName: institutionDto.name,
      coursesCount: institutionDto.institutionCourses.filter((ic) => ic.isActive).length,
      message: 'Retrieved institution details',
      userId: auth.user?.id,
    })

    return inertia.render('manage/institutions/show', {
      institution: institutionDto,
      coursesByLevel,
    })
  }
}
