// import db from '@adonisjs/lucid/services/db'
// import { BaseSeeder } from '@adonisjs/lucid/seeders'

// export default class QuestionSeeder extends BaseSeeder {
//   async run() {
//     try {
//       // Step 1: Create unit (level 1)
//       const [unitId] = await db
//         .table('content_nodes')
//         .insert({
//           type_id: 1, // Direct ID reference
//           parent_id: null,
//           title: 'Programming Basics',
//           slug: 'programming-basics',
//           content: '# Programming Basics',
//         })
//         .returning('id')

//       // Step 2: Create topic (level 2)
//       const [topicId] = await db
//         .table('content_nodes')
//         .insert({
//           type_id: 2, // Direct ID reference
//           parent_id: unitId,
//           title: 'Variables and Data Types',
//           slug: 'variables-and-data-types',
//           content: '# Variables and Data Types',
//         })
//         .returning('id')

//       // Step 3: Create subtopic (level 3)
//       const [subtopicId] = await db
//         .table('content_nodes')
//         .insert({
//           type_id: 3, // Direct ID reference
//           parent_id: topicId,
//           title: 'Introduction to Variables',
//           slug: 'intro-to-variables',
//           content: '# Introduction to Variables\n\nVariables are fundamental to programming...',
//         })
//         .returning('id')

//       // Step 4: Create MCQ
//       const [mcqId] = await db
//         .table('questions')
//         .insert({
//           content_id: subtopicId,
//           type: 'mcq',
//           question_text: 'Which of the following is a valid variable name in Python?',
//           config: JSON.stringify({
//             options: ['_variable', '123variable', 'class', '@variable'],
//             correct_answer: '_variable',
//             explanation:
//               'Variable names can start with underscore but not with numbers or special characters',
//           }),
//           points: 2,
//         })
//         .returning('id')

//       console.log('Seeding completed successfully')
//     } catch (error) {
//       console.error('Seeding failed:', error)
//       throw error
//     }
//   }
// }
