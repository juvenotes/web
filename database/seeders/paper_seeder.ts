import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { ensureAdmin } from '#utils/ensure_admin'
import { generateSlug } from '#utils/slug_generator'
import { ExamType, PaperType } from '#enums/exam_type'
import db from '@adonisjs/lucid/services/db'

export default class PaperSeeder extends BaseSeeder {
  private computerQuestions = [
    {
      text: 'Which component is considered the "brain" of the computer?',
      choices: [
        { text: 'CPU', correct: true, explanation: 'The CPU processes all computer operations' },
        { text: 'Monitor', correct: false, explanation: 'The monitor only displays output' },
        { text: 'Hard Drive', correct: false, explanation: 'Hard drives only store data' },
        { text: 'Keyboard', correct: false, explanation: 'Keyboards are input devices only' },
      ],
    },
    {
      text: 'What is the main function of RAM?',
      choices: [
        {
          text: 'Temporary data storage',
          correct: true,
          explanation: 'RAM provides fast, temporary storage',
        },
        {
          text: 'Permanent storage',
          correct: false,
          explanation: 'This is the function of hard drives',
        },
        { text: 'Processing data', correct: false, explanation: "This is the CPU's function" },
        {
          text: 'Displaying information',
          correct: false,
          explanation: "This is the monitor's function",
        },
      ],
    },
    {
      text: 'What type of software is an operating system?',
      choices: [
        {
          text: 'System Software',
          correct: true,
          explanation: 'OS manages hardware and software resources',
        },
        {
          text: 'Application Software',
          correct: false,
          explanation: 'Applications run on top of the OS',
        },
        {
          text: 'Utility Software',
          correct: false,
          explanation: 'Utilities are tools for specific tasks',
        },
        { text: 'Malware', correct: false, explanation: 'Malware is harmful software' },
      ],
    },
  ]

  private anatomyQuestions = [
    {
      text: 'Which is the largest organ in the human body?',
      choices: [
        {
          text: 'Skin',
          correct: true,
          explanation: 'The skin is the largest organ by surface area',
        },
        { text: 'Liver', correct: false, explanation: 'The liver is the largest internal organ' },
        { text: 'Heart', correct: false, explanation: 'The heart is much smaller than the skin' },
        { text: 'Brain', correct: false, explanation: 'The brain is smaller than many organs' },
      ],
    },
    {
      text: 'How many chambers are in the human heart?',
      choices: [
        { text: 'Four', correct: true, explanation: 'Two atria and two ventricles' },
        { text: 'Three', correct: false, explanation: 'The heart has four chambers' },
        { text: 'Two', correct: false, explanation: 'The heart has four chambers' },
        { text: 'Six', correct: false, explanation: 'The heart has only four chambers' },
      ],
    },
    {
      text: 'What is the main function of red blood cells?',
      choices: [
        {
          text: 'Transport oxygen',
          correct: true,
          explanation: 'RBCs carry oxygen throughout the body',
        },
        {
          text: 'Fight infection',
          correct: false,
          explanation: 'This is done by white blood cells',
        },
        { text: 'Clot blood', correct: false, explanation: 'This is done by platelets' },
        {
          text: 'Produce antibodies',
          correct: false,
          explanation: 'This is done by white blood cells',
        },
      ],
    },
  ]

  async run() {
    try {
      const admin = await ensureAdmin()

      // Get and verify root concepts
      const rootConcepts = await db
        .from('concepts')
        .where('level', 0)
        .select(['id', 'title'])
        .limit(2)

      if (!rootConcepts.length) {
        throw new Error('No root concepts found. Run concept seeder first.')
      }

      console.log('Found root concepts:', rootConcepts)

      await this.seedPaper(
        admin.id,
        rootConcepts[0].id,
        'Introduction to Computers CAT 1',
        ExamType.CAT,
        this.computerQuestions
      )

      await this.seedPaper(
        admin.id,
        rootConcepts[1].id,
        'Human Anatomy EOY 2024',
        ExamType.EOY,
        this.anatomyQuestions
      )
    } catch (error) {
      console.error('Seeding failed:', error)
      throw error
    }
  }

  private async seedPaper(
    userId: number,
    conceptId: number,
    title: string,
    examType: ExamType,
    questions: any[]
  ) {
    await db.transaction(async (trx) => {
      const [paper] = await trx
        .table('past_papers')
        .insert({
          title,
          slug: generateSlug(),
          year: '2024',
          exam_type: examType,
          paper_type: PaperType.MCQ,
          concept_id: conceptId,
          user_id: userId,
        })
        .returning('*')

      for (const q of questions) {
        const [question] = await trx
          .table('questions')
          .insert({
            question_text: q.text,
            type: 'mcq',
            difficulty_level: 'medium',
            user_id: userId,
            past_paper_id: paper.id,
            slug: generateSlug(),
          })
          .returning('*')

        await trx.table('mcq_choices').insert(
          q.choices.map((c: { text: any; correct: any; explanation: any }) => ({
            question_id: question.id,
            choice_text: c.text,
            is_correct: c.correct,
            explanation: c.explanation,
          }))
        )
      }
    })
  }
}
