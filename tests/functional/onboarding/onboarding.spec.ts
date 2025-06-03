// // filepath: /home/shikamaru/web/tests/functional/onboarding/onboarding.spec.ts
// import { test } from '@japa/runner'
// import { UserFactory } from '#database/factories/user_factory'
// import EducationLevel from '#models/education_level'
// import Course from '#models/course'
// import Institution from '#models/institution'

// test.group('Onboarding', (group) => {
//   group.each.setup(async () => {
//     // Create test data: education levels, courses, and institutions if needed
//     await setupTestData()
//   })

//   test('authenticated user can view onboarding page', async ({ client }) => {
//     const user = await UserFactory.create()

//     const response = await client.get('/onboarding').loginAs(user)

//     response.assertStatus(200)
//     // response.assertTextIncludes('education level')
//   })
// })

// /**
//  * Helper function to create minimal test data needed for the test
//  */
// async function setupTestData() {
//   // Check if we already have data and only create if empty
//   const existingEducationLevels = await EducationLevel.query().limit(1)
//   if (existingEducationLevels.length > 0) {
//     return
//   }

//   // Create just the minimum data needed
//   const educationLevel = await EducationLevel.create({ name: 'Undergraduate' })
//   await Course.create({
//     name: 'Medicine',
//     educationLevelId: educationLevel.id,
//   })

//   await Institution.create({ name: 'University of Lagos' })
// }
