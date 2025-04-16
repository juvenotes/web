import string from '@adonisjs/core/helpers/string'

/**
 * Generates a hierarchical section slug in Medscape style
 * Format: concept-slug/section-title#position
 * Where position is alphabetical based on section order (a,b,c...)
 */
export function generateSectionSlug(
  conceptSlug: string,
  sectionTitle: string,
  position: number,
  parentPositionIdentifier?: string
): string {
  // Convert the section title to kebab-case using AdonisJS string helper
  const titleSlug = string.slug(sectionTitle)

  // Convert position to alphabetical identifier (1 -> a, 2 -> b, etc.)
  const positionChar = String.fromCharCode(96 + position) // 'a' is 97 in ASCII

  // If this is a subsection (parent position identifier provided)
  if (parentPositionIdentifier) {
    return `${conceptSlug}/${titleSlug}#${parentPositionIdentifier}${positionChar}`
  }

  // For top-level sections
  return `${conceptSlug}/${titleSlug}#${positionChar}`
}

/**
 * Extract the position identifier from a section slug
 * e.g., "hypertension/treatment#b" returns "b"
 *       "hypertension/medication#ba" returns "ba"
 */
export function extractPositionIdentifier(slug: string): string | null {
  const match = slug.match(/#([a-z]+)$/)
  return match ? match[1] : null
}

/**
 * Helper function to use with the ConceptSection model
 * Requires both the section and its parent (if any)
 */
export async function generateSectionSlugFromModels(
  section: any,
  concept: any,
  parentSection?: any
): Promise<string> {
  if (parentSection) {
    const parentIdentifier = extractPositionIdentifier(parentSection.slug)

    if (!parentIdentifier) {
      throw new Error('Parent section has invalid slug format')
    }

    return generateSectionSlug(concept.slug, section.title, section.position, parentIdentifier)
  }

  return generateSectionSlug(concept.slug, section.title, section.position)
}
