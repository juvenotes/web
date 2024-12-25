export type ConceptMetadata = {
  timeEstimate?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  prerequisites?: string[]
  objectives?: string[]
  status?: 'draft' | 'review' | 'published'
  lastReviewed?: string
  authors?: string[]
  [key: string]: any
}

export interface CreateConceptDTO {
  title: string
  parentId?: number
  knowledgeBlock?: string
  isTerminal: boolean
  level: number
  metadata: ConceptMetadata
}
