export enum QuestionType {
  MCQ = 'mcq',
  SAQ = 'saq',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export type QuestionTypeKey = keyof typeof QuestionType
export type DifficultyLevelKey = keyof typeof DifficultyLevel
