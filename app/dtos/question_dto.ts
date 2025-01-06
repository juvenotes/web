import type Question from '#models/question'

export class QuestionDto {
  constructor(private question: Question) {}

  toJSON() {
    return {
      id: this.question.id,
      type: this.question.type,
      questionText: this.question.questionText,
      difficultyLevel: this.question.difficultyLevel,
      slug: this.question.slug,
      choices:
        this.question.type === 'mcq'
          ? this.question.choices?.map((choice) => ({
              id: choice.id,
              choiceText: choice.choiceText,
              isCorrect: choice.isCorrect,
              explanation: choice.explanation,
            }))
          : undefined,
      parts:
        this.question.type === 'saq'
          ? this.question.parts?.map((part) => ({
              id: part.id,
              partText: part.partText,
              expectedAnswer: part.expectedAnswer,
              marks: part.marks,
            }))
          : undefined,
    } as const
  }
}
