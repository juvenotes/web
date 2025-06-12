/**
 * Raw row structure from Supabase 'medical_articles' table
 */
export interface RawArticleRow {
  pk_id: number
  original_filename: string
  article_id: string
  article_name: string
  library_id: string
  keywords: string // comma-separated string in CSV, maps to text[] in DB
  full_data_content: FullDataContent
  imported_at: string // ISO timestamp
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
