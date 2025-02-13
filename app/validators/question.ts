import vine from '@vinejs/vine'
import { QuestionType } from '#enums/question_types'

// MCQ Choice Schema
const mcqChoiceSchema = vine.object({
  choice_text: vine.string().minLength(1).maxLength(1000),
  is_correct: vine.boolean(),
  explanation: vine.string().minLength(1).maxLength(1000),
})

// SAQ Part Schema
const saqPartSchema = vine.object({
  part_text: vine.string().minLength(1).maxLength(1000),
  expected_answer: vine.string().minLength(1).maxLength(2000),
  marks: vine.number().min(0).max(100),
})

const oscePartSchema = vine.object({
  partText: vine.string().trim().minLength(1),
  expectedAnswer: vine.string().trim().minLength(1).maxLength(5000),
  marks: vine.number().min(1),
  imagePath: vine.string().nullable().optional(),
})

export const createMcqQuestionValidator = vine.compile(
  vine.object({
    questionText: vine.string().trim().minLength(1),
    type: vine.literal(QuestionType.MCQ),
    choices: vine
      .array(
        vine.object({
          choiceText: vine.string().trim().minLength(1),
          isCorrect: vine.boolean(),
          explanation: vine.string().nullable().optional(),
        })
      )
      .minLength(1),
  })
)

export const createSaqQuestionValidator = vine.compile(
  vine.object({
    questionText: vine.string().trim().minLength(1),
    type: vine.literal(QuestionType.SAQ),
    parts: vine
      .array(
        vine.object({
          partText: vine.string().trim().minLength(1),
          expectedAnswer: vine.string().trim().minLength(1).maxLength(5000),
          marks: vine.number().min(1),
        })
      )
      .minLength(1),
  })
)

export const updateMcqQuestionValidator = vine.compile(
  vine.object({
    questionText: vine.string().trim().minLength(1),
    type: vine.literal(QuestionType.MCQ),
    choices: vine
      .array(
        vine.object({
          choiceText: vine.string().trim().minLength(1),
          isCorrect: vine.boolean(),
          explanation: vine.string().nullable().optional(),
        })
      )
      .minLength(1),
  })
)
export const updateSaqQuestionValidator = vine.compile(
  vine.object({
    questionText: vine.string().trim().minLength(1),
    type: vine.literal(QuestionType.SAQ),
    parts: vine
      .array(
        vine.object({
          partText: vine.string().trim().minLength(1),
          expectedAnswer: vine.string().trim().minLength(1),
          marks: vine.number().min(1),
        })
      )
      .minLength(1),
  })
)

export const updateQuestionValidator = vine.compile(
  vine.object({
    question_text: vine.string().minLength(3).maxLength(1000).optional(),
    choices: vine.array(mcqChoiceSchema).optional(),
    parts: vine.array(saqPartSchema).optional(),
  })
)

export const createOsceQuestionValidator = vine.compile(
  vine.object({
    questionText: vine.string().trim().minLength(1),
    questionImagePath: vine.string().nullable().optional(),
    type: vine.literal(QuestionType.OSCE),
    parts: vine.array(oscePartSchema).minLength(1).maxLength(5),
  })
)

export const updateOsceQuestionValidator = vine.compile(
  vine.object({
    questionText: vine.string().trim().minLength(1),
    questionImagePath: vine.string().nullable().optional(),
    type: vine.literal(QuestionType.OSCE),
    parts: vine.array(oscePartSchema).minLength(1).maxLength(5),
  })
)
