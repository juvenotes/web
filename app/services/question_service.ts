import Question from '#models/question'
import { QuestionType, DifficultyLevel } from '#enums/question_types'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

interface McqChoice {
  choiceText: string
  isCorrect: boolean
  explanation: string
}

interface SaqPart {
  partText: string
  expectedAnswer: string
  marks: number
}

interface CreateQuestionDTO {
  userId: number
  type: QuestionType
  questionText: string
  difficultyLevel: DifficultyLevel
  conceptIds: number[]
  mcqChoices?: McqChoice[]
  saqParts?: SaqPart[]
}

export default class QuestionService {
  async create(data: CreateQuestionDTO, trx?: TransactionClientContract) {
    const question = await Question.create(
      {
        userId: data.userId,
        type: data.type,
        questionText: data.questionText,
        difficultyLevel: data.difficultyLevel,
      },
      { client: trx }
    )

    await question.related('concepts').attach(data.conceptIds, trx)

    if (data.type === QuestionType.MCQ && data.mcqChoices) {
      await question.related('choices').createMany(data.mcqChoices, { client: trx })
    }

    if (data.type === QuestionType.SAQ && data.saqParts) {
      await question.related('parts').createMany(data.saqParts, { client: trx })
    }

    return question
  }
}
