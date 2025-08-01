import { test } from '@japa/runner'

test.group('Simple Math Test', () => {
  test('should add two numbers correctly', ({ assert }) => {
    assert.equal(2 + 2, 4)
  })

  test('should multiply numbers correctly', ({ assert }) => {
    assert.equal(3 * 4, 12)
  })
})