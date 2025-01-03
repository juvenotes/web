import type Paper from '#models/past_paper'

export class PaperDetailsDto {
  constructor(private paper: Paper) {}

  toJSON() {
    return {
      id: this.paper.id,
      title: this.paper.title,
      slug: this.paper.slug,
      year: this.paper.year,
      examType: this.paper.examType,
      paperType: this.paper.paperType,
      concept: {
        id: this.paper.concept.id,
        title: this.paper.concept.title,
        slug: this.paper.concept.slug,
      },
      questions: this.paper.questions.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        difficultyLevel: q.difficultyLevel,
        choices: q.choices?.map((c) => ({
          id: c.id,
          text: c.choiceText,
          isCorrect: c.isCorrect,
          explanation: c.explanation,
        })),
        parts: q.parts?.map((p) => ({
          id: p.id,
          text: p.partText,
          expectedAnswer: p.expectedAnswer,
          marks: p.marks,
        })),
      })),
    } as const
  }
}
