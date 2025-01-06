import type Paper from '#models/past_paper'
export class ManagePaperDto {
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
      },
      questions: this.paper.questions.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        difficultyLevel: q.difficultyLevel,
      })),
    } as const
  }
}
