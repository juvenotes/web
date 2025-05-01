// filepath: /home/shikamaru/web/tests/functional/onboarding/onboarding.spec.ts
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import EducationLevel from '#models/education_level'
import Course from '#models/course'
import Institution from '#models/institution'
import InstitutionCourse from '#models/institution_course'
import UserEnrollment from '#models/user_enrollment'
import Hash from '@adonisjs/core/services/hash'
import Database from '@adonisjs/lucid/services/db'

test.group('Onboarding', (group) => {
  let user: User
  let educationLevel: EducationLevel
  let course: Course
  let institution: Institution
  let graduationYear: number

  group.each.setup(async () => {
    // Clear related tables to avoid conflicts
    await UserEnrollment.query().delete()
    await InstitutionCourse.query().delete()

    // Create a test user
    user = await UserFactory.merge({
      password: await Hash.make('Password123!'),
    }).create()

    // Create test data for onboarding
    educationLevel = await EducationLevel.firstOrCreate({ name: 'Medical School' })
    course = await Course.firstOrCreate({
      name: 'Medicine',
      educationLevelId: educationLevel.id,
    })
    institution = await Institution.firstOrCreate({ name: 'Test University' })
    graduationYear = new Date().getFullYear() + 4 // 4 years from now
  })

  group.each.teardown(async () => {
    // Clean up after tests
    await Database.from('user_enrollments').delete()
  })

  test('unauthenticated user is redirected to login', async ({ client }) => {
    const response = await client.get('/onboarding')

    response.assertStatus(302)
    response.assertRedirectsTo('/login')
  })

  test('authenticated user can view onboarding page', async ({ client }) => {
    const response = await client.get('/onboarding').withCsrfToken().loginAs(user)

    response.assertStatus(200)
  })

  test('can fetch courses by education level', async ({ client, assert }) => {
    const response = await client
      .get(`/api/onboarding/courses?educationLevelId=${educationLevel.id}`)
      .withCsrfToken()
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body)
    assert.isNotEmpty(body)

    const foundCourse = body.find((c: any) => c.id === course.id)
    assert.exists(foundCourse)
    assert.equal(foundCourse.name, course.name)
  })

  test('can fetch all institutions', async ({ client, assert }) => {
    const response = await client.get('/api/onboarding/institutions').withCsrfToken().loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body)
    assert.isNotEmpty(body)

    const foundInstitution = body.find((i: any) => i.id === institution.id)
    assert.exists(foundInstitution)
    assert.equal(foundInstitution.name, institution.name)
  })

  test('can submit onboarding form', async ({ client, assert }) => {
    // First check there are no enrollments
    const noEnrollments = await UserEnrollment.query().where('userId', user.id).first()

    assert.isNull(noEnrollments)

    // Submit the onboarding form
    const response = await client.post('/onboarding').withCsrfToken().loginAs(user).form({
      educationLevelId: educationLevel.id,
      courseId: course.id,
      institutionId: institution.id,
      graduationYear,
    })

    response.assertStatus(302)
    response.assertRedirectsTo('/learn') // Default redirect destination

    // Verify the enrollment was created
    const enrollment = await UserEnrollment.query().where('userId', user.id).first()

    assert.exists(enrollment)

    // Find the institution course that was created or found
    const institutionCourse = await InstitutionCourse.query()
      .where('institutionId', institution.id)
      .where('courseId', course.id)
      .first()

    assert.exists(institutionCourse)
    assert.equal(enrollment!.institutionCourseId, institutionCourse!.id)
    assert.equal(enrollment!.graduationYear, graduationYear)
  })

  test('already enrolled user is redirected from onboarding', async ({ client }) => {
    // First create an enrollment for this user
    const institutionCourse = await InstitutionCourse.firstOrCreate({
      institutionId: institution.id,
      courseId: course.id,
    })

    await UserEnrollment.create({
      userId: user.id,
      institutionCourseId: institutionCourse.id,
      graduationYear,
    })

    // Try to access onboarding
    const response = await client.get('/onboarding').withCsrfToken().loginAs(user)

    response.assertStatus(302)
    response.assertRedirectsTo('/learn') // Default redirect destination
  })

  test('cannot submit onboarding form with invalid data', async ({ client }) => {
    const response = await client.post('/onboarding').withCsrfToken().loginAs(user).form({
      // Missing educationLevelId
      courseId: course.id,
      institutionId: institution.id,
      graduationYear,
    })

    response.assertStatus(422) // Validation error status
  })

  test('redirects to intended destination after onboarding', async ({ client }) => {
    const customDestination = '/my-custom-page'

    // Start a session and set the return_to value
    await client.get('/login').withCsrfToken()
    await client
      .post('/session/store-return-to')
      .withCsrfToken()
      .form({ returnTo: customDestination })

    // Login
    await client.post('/login').withCsrfToken().form({
      email: user.email,
      password: 'Password123!',
    })

    // Submit the onboarding form
    const response = await client.post('/onboarding').withCsrfToken().form({
      educationLevelId: educationLevel.id,
      courseId: course.id,
      institutionId: institution.id,
      graduationYear,
    })

    response.assertStatus(302)
    response.assertRedirectsTo(customDestination)
  })
})
