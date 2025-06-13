/**
 * Raw row structure from Supabase 'medical_articles' table
 */
export interface RawArticleRow {
  pkId: number
  originalFilename: string
  articleId: string
  articleName: string
  libraryId: string
  keywords: string
  fullDataContent: FullDataContent // Note: camelCase for frontend
  importedAt: string
}

/**
 * JSONB structure stored in 'full_data_content'
 */
export interface FullDataContent {
  id: string
  name: string
  title: string // HTML title fragment
  usage: {
    highlights: any[]
    bookmarkedAt: string | null
  }
  content: string // Full HTML content
  headers: Header[]
  keywords: string // comma-separated keywords
  subjects: Subject[]
  libraryId: string
  relatedArticles: any[]
}

/**
 * Represents a header element within the article
 */
export interface Header {
  id: string
  name: string
  level: number
}

/**
 * Represents a subject/category tag
 */
export interface Subject {
  id: string
  name: string
}

/**
 * Cleaned-up article model for frontend use
 */
export interface Article {
  /** Unique article identifier */
  id: string
  /** Human-readable title */
  title: string
  /** Array of keywords for search/filter */
  keywords: string[]
  /** Complete HTML body of the article */
  htmlContent: string
  /** Section headers for navigation */
  headers: Header[]
  /** Subject tags for categorization */
  subjects: Subject[]
  /** Date when imported into the library */
  importedAt: string
}

/**
 * Lightweight summary used in listings
 */
export interface ArticleSummary {
  id: string
  title: string
  keywords: string[]
  importedAt: string
}
