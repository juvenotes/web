import { test } from '@japa/runner'
import { generateSlug } from '#utils/slug_generator'

test.group('Utils - Slug Generator', () => {
  test('should generate slug with default length of 8', ({ assert }) => {
    const slug = generateSlug()
    
    assert.lengthOf(slug, 8)
    assert.match(slug, /^[a-zA-Z0-9]+$/)
  })

  test('should generate slug with custom length', ({ assert }) => {
    const length = 12
    const slug = generateSlug(length)
    
    assert.lengthOf(slug, length)
    assert.match(slug, /^[a-zA-Z0-9]+$/)
  })

  test('should generate different slugs on multiple calls', ({ assert }) => {
    const slugs = new Set()
    
    // Generate 100 slugs to test randomness
    for (let i = 0; i < 100; i++) {
      slugs.add(generateSlug())
    }
    
    // Should have generated unique slugs (very low probability of collision)
    assert.isAbove(slugs.size, 95)
  })

  test('should only contain alphanumeric characters', ({ assert }) => {
    const slug = generateSlug(20)
    
    // Should not contain special characters or whitespace
    assert.match(slug, /^[a-zA-Z0-9]+$/)
    assert.isFalse(slug.includes('/'))
    assert.isFalse(slug.includes('+'))
    assert.isFalse(slug.includes('='))
  })

  test('should generate empty string for length 0', ({ assert }) => {
    const slug = generateSlug(0)
    
    assert.lengthOf(slug, 0)
    assert.equal(slug, '')
  })

  test('should handle large length values', ({ assert }) => {
    const length = 50
    const slug = generateSlug(length)
    
    assert.lengthOf(slug, length)
    assert.match(slug, /^[a-zA-Z0-9]+$/)
  })
})