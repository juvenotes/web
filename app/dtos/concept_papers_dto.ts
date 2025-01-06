import type Concept from '#models/concept'
import PastPaper from '#models/past_paper'
import { PaperDto } from './paper_dto.js'

export class ConceptPapersDto {
  constructor(private concept: Concept) {}

  toJSON() {
    const papers = (this.concept.$preloaded.pastPapers || []) as PastPaper[]

    return {
      id: this.concept.id,
      title: this.concept.title,
      slug: this.concept.slug,
      papers: papers.map((paper: PastPaper) => new PaperDto(paper).toJSON()),
      paperTypes: [...new Set(papers.map((p: { paperType: any }) => p.paperType))],
      examTypes: [...new Set(papers.map((p: { examType: any }) => p.examType))],
      years: [...new Set(papers.map((p: { year: any }) => p.year))].sort().reverse(),
    } as const
  }
}
