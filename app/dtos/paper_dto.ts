import type Paper from '#models/past_paper'

export class PaperDto {
  constructor(private paper: Paper) {}

  toJSON() {
    return {
      id: this.paper.id,
      title: this.paper.title,
      slug: this.paper.slug,
      year: this.paper.year,
      examType: this.paper.examType,
      paperType: this.paper.paperType,
      questionsCount: this.paper.questions.length,
    } as const
  }
}
