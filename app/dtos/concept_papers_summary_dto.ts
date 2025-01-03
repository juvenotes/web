import type Concept from '#models/concept'
import type PastPaper from '#models/past_paper'

export class ConceptPapersSummaryDto {
  constructor(private concept: Concept) {}

  toJSON() {
    const papers = (this.concept.$preloaded.pastPapers || []) as PastPaper[]

    return {
      id: this.concept.id,
      title: this.concept.title,
      slug: this.concept.slug,
      paperCounts: {
        mcq: papers.filter((p) => p.paperType === 'mcq').length,
        saq: papers.filter((p) => p.paperType === 'saq').length,
        mixed: papers.filter((p) => p.paperType === 'mixed').length,
      },
      papers: papers.map((paper) => ({
        id: paper.id,
        title: paper.title,
        slug: paper.slug,
        year: paper.year,
        examType: paper.examType,
        paperType: paper.paperType,
        questionsCount: paper.questions?.length || 0,
      })),
    } as const
  }
}
