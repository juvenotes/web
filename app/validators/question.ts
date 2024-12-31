import vine from '@vinejs/vine'
import { QuestionType, DifficultyLevel } from '#enums/question_types'

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

export const createQuestionValidator = vine.compile(
  vine.object({
    type: vine.enum(Object.values(QuestionType)),
    question_text: vine.string().minLength(3).maxLength(1000),
    difficulty_level: vine.enum(Object.values(DifficultyLevel)),
    concept_ids: vine.array(vine.number()).minLength(1),
    choices: vine.array(mcqChoiceSchema).optional(),
    parts: vine.array(saqPartSchema).optional(),
  })
)

export const updateQuestionValidator = vine.compile(
  vine.object({
    question_text: vine.string().minLength(3).maxLength(1000).optional(),
    difficulty_level: vine.enum(Object.values(DifficultyLevel)).optional(),
    concept_ids: vine.array(vine.number()).minLength(1).optional(),
    choices: vine.array(mcqChoiceSchema).optional(),
    parts: vine.array(saqPartSchema).optional(),
  })
)
