import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import Institution from '#models/institution'
import { personalizationValidator } from '#validators/personalization'
import InstitutionDto from '#dtos/institution'
import CourseDto from '#dtos/course'
import EducationLevelDto from '#dtos/education_level'
import EducationLevel from '#models/education_level'

interface PersonalizationProps {
  institutions: InstitutionDto[]
  courses: CourseDto[]
  educationLevels: EducationLevelDto[]
}

export default class PersonalizationController {
  async show({ inertia }: HttpContext) {
    const [institutions, courses, educationLevels] = await Promise.all([
      Institution.query().where('is_active', true).orderBy('name'),
      Course.query().orderBy('name'),
      EducationLevel.query().orderBy('id'),
    ])

    return inertia.render<PersonalizationProps>('auth/personalize', {
      institutions: institutions.map((i) => new InstitutionDto(i)),
      courses: courses.map((c) => new CourseDto(c)),
      educationLevels: educationLevels.map((e) => new EducationLevelDto(e)),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(personalizationValidator)

    await user.related('userEducationEntries').create({
      institutionCourseId: data.institution_course_id,
      educationLevelId: data.education_level_id,
      graduationYear: data.graduation_year,
    })

    return response.redirect().toPath('/learn')
  }
}
