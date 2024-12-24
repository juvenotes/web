import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { generateSlug } from '#utils/slug_generator'

export default class QuestionSeeder extends BaseSeeder {
  async run() {
    // MCQ Template for Concept 10
    const mcqsForConcept10 = [
      {
        slug: generateSlug(),
        type: 'mcq',
        question_text: 'What is the primary function of RAM?',
        config: {
          options: {
            A: 'Permanent storage of data',
            B: 'Temporary storage of running programs',
            C: 'Processing calculations',
            D: 'Storing the operating system',
          },
          correct_answer: 'B',
          explanations: {
            A: 'This is the function of hard drives',
            B: 'RAM provides temporary storage for running programs',
            C: "This is the CPU's function",
            D: 'The OS is stored in permanent storage',
          },
        },
        marks: 2,
      },
      {
        slug: generateSlug(),
        type: 'mcq',
        question_text: 'Which component is considered the brain of the computer?',
        config: {
          options: {
            A: 'RAM',
            B: 'CPU',
            C: 'Hard Drive',
            D: 'Motherboard',
          },
          correct_answer: 'B',
          explanations: {
            A: 'RAM temporarily stores data but does not perform processing.',
            B: 'The CPU processes data and is considered the brain of the computer.',
            C: 'The hard drive stores data but does not process it.',
            D: 'The motherboard connects all components but does not perform processing.',
          },
        },
        marks: 2,
      },
      {
        slug: generateSlug(),
        type: 'mcq',
        question_text: 'What is the primary function of an operating system?',
        config: {
          options: {
            A: 'Perform calculations',
            B: 'Manage computer hardware and software',
            C: 'Store files permanently',
            D: 'Connect the computer to the internet',
          },
          correct_answer: 'B',
          explanations: {
            A: 'Performing calculations is primarily done by the CPU.',
            B: 'The operating system manages hardware and software, providing a user interface.',
            C: 'Permanent file storage is handled by storage devices like hard drives.',
            D: 'Internet connectivity requires additional software or hardware.',
          },
        },
        marks: 2,
      },
    ]

    // SAQs Template for Concept 10
    const saqsForConcept10 = [
      {
        slug: generateSlug(),
        type: 'saq',
        question_text: 'Explain the difference between RAM and ROM.',
        config: {
          parts: [
            {
              part_number: 1,
              text: 'Explain RAM characteristics',
              marks: 2,
              rubric: [
                {
                  point: 'Volatility',
                  subpoints: [
                    { text: 'Mentions temporary storage', marks: 1 },
                    { text: 'Explains data loss on power off', marks: 1 },
                  ],
                },
              ],
              model_answer: 'RAM is volatile memory that loses its contents when powered off.',
            },
          ],
          total_marks: 4,
          pass_mark: 2,
          time_allocation_minutes: 10,
        },
        marks: 4,
      },
      {
        slug: generateSlug(),
        type: 'saq',
        question_text: 'Describe the structure of a typical animal cell.',
        config: {
          parts: [
            {
              part_number: 1,
              text: 'Explain the role of the nucleus.',
              marks: 2,
              rubric: [
                {
                  point: 'Functions',
                  subpoints: [
                    { text: 'Mentions control of cell activities', marks: 1 },
                    { text: 'Explains storage of genetic material', marks: 1 },
                  ],
                },
              ],
              model_answer:
                'The nucleus controls cell activities and stores genetic material in the form of DNA.',
            },
            {
              part_number: 2,
              text: 'Describe the function of mitochondria.',
              marks: 2,
              rubric: [
                {
                  point: 'Energy production',
                  subpoints: [
                    { text: 'Mentions ATP generation', marks: 1 },
                    { text: 'Explains role in cellular respiration', marks: 1 },
                  ],
                },
              ],
              model_answer:
                'Mitochondria generate ATP through cellular respiration, providing energy for the cell.',
            },
          ],
          total_marks: 4,
          pass_mark: 2,
          time_allocation_minutes: 10,
        },
        marks: 4,
      },
      {
        slug: generateSlug(),
        type: 'saq',
        question_text: 'Outline the differences between arteries and veins.',
        config: {
          parts: [
            {
              part_number: 1,
              text: 'Describe two characteristics of arteries.',
              marks: 2,
              rubric: [
                {
                  point: 'Structure',
                  subpoints: [
                    { text: 'Mentions thick muscular walls', marks: 1 },
                    { text: 'Explains narrow lumen', marks: 1 },
                  ],
                },
              ],
              model_answer:
                'Arteries have thick muscular walls to withstand high pressure and a narrow lumen to maintain blood flow.',
            },
            {
              part_number: 2,
              text: 'Describe two characteristics of veins.',
              marks: 2,
              rubric: [
                {
                  point: 'Structure',
                  subpoints: [
                    { text: 'Mentions thin walls', marks: 1 },
                    { text: 'Explains presence of valves', marks: 1 },
                  ],
                },
              ],
              model_answer:
                'Veins have thin walls due to lower pressure and valves to prevent backflow of blood.',
            },
          ],
          total_marks: 4,
          pass_mark: 2,
          time_allocation_minutes: 10,
        },
        marks: 4,
      },
    ]

    // Insert questions
    for (const question of [...mcqsForConcept10, ...saqsForConcept10]) {
      const [{ id: questionId }] = await db.table('questions').insert(question).returning('id')

      // Link to concept 10
      await db.table('concept_question').insert({
        concept_id: 10,
        question_id: questionId,
      })
    }

    // Repeat similar process for concept 11
    // ... Add similar questions for concept 11

    console.log('Questions seeded successfully')
  }
}
