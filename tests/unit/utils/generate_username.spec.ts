import { test } from '@japa/runner'
import { generateUsername } from '#utils/generate_username'

test.group('Utils - Generate Username', () => {
  test('should generate username with default options', ({ assert }) => {
    const username = generateUsername()
    
    // Should contain at least adjective-noun
    assert.match(username, /^\w+-\w+(-\d+)?$/)
    
    // Should contain a hyphen
    assert.isTrue(username.includes('-'))
  })

  test('should generate username without number when useNumber is false', ({ assert }) => {
    const username = generateUsername({ useNumber: false })
    
    // Should only have adjective-noun pattern (no trailing number)
    assert.match(username, /^\w+-\w+$/)
    assert.isFalse(/\d+$/.test(username))
  })

  test('should generate username with number when useNumber is true', ({ assert }) => {
    const username = generateUsername({ useNumber: true })
    
    // Should have adjective-noun-number pattern
    assert.match(username, /^\w+-\w+-\d+$/)
  })

  test('should generate username with swahili nouns when nounType is swahili', ({ assert }) => {
    const swahiliNouns = [
      'simba', 'ndovu', 'twiga', 'kifaru', 'nyati', 'chui', 'nyoni', 'tai',
      'kipepeo', 'kiboko', 'duma', 'nyuki', 'kasa', 'ndege', 'korongo',
      'kunguru', 'manga', 'farasi', 'kayanda'
    ]
    
    const username = generateUsername({ nounType: 'swahili', useNumber: false })
    const parts = username.split('-')
    
    assert.lengthOf(parts, 2)
    assert.include(swahiliNouns, parts[1])
  })

  test('should generate username with english nouns when nounType is english', ({ assert }) => {
    const englishNouns = [
      'eagle', 'falcon', 'gazelle', 'zebra', 'giraffe', 'dolphin', 'phoenix',
      'tiger', 'leopard', 'antelope', 'butterfly', 'robin', 'crane', 'turtle'
    ]
    
    const username = generateUsername({ nounType: 'english', useNumber: false })
    const parts = username.split('-')
    
    assert.lengthOf(parts, 2)
    assert.include(englishNouns, parts[1])
  })

  test('should generate different usernames on multiple calls', ({ assert }) => {
    const usernames = new Set()
    
    // Generate 50 usernames to test randomness
    for (let i = 0; i < 50; i++) {
      usernames.add(generateUsername())
    }
    
    // Should have generated at least 40 unique usernames (allowing some collisions)
    assert.isAbove(usernames.size, 40)
  })

  test('should generate username with random noun type when nounType is random', ({ assert }) => {
    const username = generateUsername({ nounType: 'random', useNumber: false })
    const parts = username.split('-')
    
    assert.lengthOf(parts, 2)
    assert.isString(parts[0]) // adjective
    assert.isString(parts[1]) // noun
  })

  test('should generate number between 0-99 when using numbers', ({ assert }) => {
    const username = generateUsername({ useNumber: true })
    const parts = username.split('-')
    
    if (parts.length === 3) {
      const number = parseInt(parts[2])
      assert.isNumber(number)
      assert.isAbove(number, -1)
      assert.isBelow(number, 100)
    }
  })
})