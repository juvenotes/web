import { test } from '@japa/runner'
import {
  generateSectionSlug,
  extractPositionIdentifier,
  generateSectionSlugFromModels
} from '#utils/generate_section_slug'

test.group('Utils - Generate Section Slug', () => {
  test('should generate top-level section slug', ({ assert }) => {
    const slug = generateSectionSlug('hypertension', 'Introduction', 1)
    
    assert.equal(slug, 'hypertension/introduction#a')
  })

  test('should generate section slug with position mapping', ({ assert }) => {
    assert.equal(generateSectionSlug('diabetes', 'Symptoms', 1), 'diabetes/symptoms#a')
    assert.equal(generateSectionSlug('diabetes', 'Treatment', 2), 'diabetes/treatment#b')
    assert.equal(generateSectionSlug('diabetes', 'Prevention', 3), 'diabetes/prevention#c')
  })

  test('should generate subsection slug with parent identifier', ({ assert }) => {
    const slug = generateSectionSlug('cancer', 'Chemotherapy', 1, 'b')
    
    assert.equal(slug, 'cancer/chemotherapy#ba')
  })

  test('should generate deep nested subsection slug', ({ assert }) => {
    const slug = generateSectionSlug('cardiology', 'Side Effects', 2, 'ab')
    
    assert.equal(slug, 'cardiology/side-effects#abb')
  })

  test('should handle special characters in section title', ({ assert }) => {
    const slug = generateSectionSlug('neurology', 'Signs & Symptoms', 1)
    
    assert.equal(slug, 'neurology/signs-symptoms#a')
  })

  test('should handle spaces and punctuation in titles', ({ assert }) => {
    const slug = generateSectionSlug('psychiatry', 'Diagnosis: Clinical Assessment', 3)
    
    assert.equal(slug, 'psychiatry/diagnosis-clinical-assessment#c')
  })

  test('should handle high position numbers', ({ assert }) => {
    const slug = generateSectionSlug('medicine', 'Section Z', 26)
    
    assert.equal(slug, 'medicine/section-z#z')
  })
})

test.group('Utils - Extract Position Identifier', () => {
  test('should extract single character position identifier', ({ assert }) => {
    assert.equal(extractPositionIdentifier('hypertension/treatment#b'), 'b')
    assert.equal(extractPositionIdentifier('diabetes/symptoms#a'), 'a')
    assert.equal(extractPositionIdentifier('cancer/diagnosis#z'), 'z')
  })

  test('should extract multi-character position identifier', ({ assert }) => {
    assert.equal(extractPositionIdentifier('cardiology/treatment#ba'), 'ba')
    assert.equal(extractPositionIdentifier('neurology/symptoms#abc'), 'abc')
  })

  test('should return null for invalid slug format', ({ assert }) => {
    assert.isNull(extractPositionIdentifier('hypertension/treatment'))
    assert.isNull(extractPositionIdentifier('diabetes/symptoms#'))
    assert.isNull(extractPositionIdentifier('cancer/diagnosis#123'))
    assert.isNull(extractPositionIdentifier('invalid-slug'))
  })

  test('should return null for empty or null input', ({ assert }) => {
    assert.isNull(extractPositionIdentifier(''))
    assert.isNull(extractPositionIdentifier('#a'))
  })
})

test.group('Utils - Generate Section Slug From Models', () => {
  test('should generate slug for top-level section from models', async ({ assert }) => {
    const section = { title: 'Introduction', position: 1 }
    const concept = { slug: 'hypertension' }
    
    const slug = await generateSectionSlugFromModels(section, concept)
    
    assert.equal(slug, 'hypertension/introduction#a')
  })

  test('should generate slug for subsection from models', async ({ assert }) => {
    const section = { title: 'Medications', position: 2 }
    const concept = { slug: 'diabetes' }
    const parentSection = { slug: 'diabetes/treatment#b' }
    
    const slug = await generateSectionSlugFromModels(section, concept, parentSection)
    
    assert.equal(slug, 'diabetes/medications#bb')
  })

  test('should throw error for parent section with invalid slug', async ({ assert }) => {
    const section = { title: 'Subsection', position: 1 }
    const concept = { slug: 'cardiology' }
    const parentSection = { slug: 'invalid-slug-format' }
    
    await assert.rejects(
      async () => await generateSectionSlugFromModels(section, concept, parentSection),
      'Parent section has invalid slug format'
    )
  })

  test('should handle complex nested structure', async ({ assert }) => {
    const section = { title: 'Drug Interactions', position: 3 }
    const concept = { slug: 'pharmacology' }
    const parentSection = { slug: 'pharmacology/beta-blockers#ab' }
    
    const slug = await generateSectionSlugFromModels(section, concept, parentSection)
    
    assert.equal(slug, 'pharmacology/drug-interactions#abc')
  })
})