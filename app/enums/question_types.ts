export enum QuestionType {
  MCQ = 'mcq',
  SAQ = 'saq',
  OSCE = 'osce',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export type QuestionTypeKey = keyof typeof QuestionType
export type DifficultyLevelKey = keyof typeof DifficultyLevel
