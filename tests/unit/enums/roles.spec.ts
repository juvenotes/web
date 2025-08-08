import { test } from '@japa/runner'
import { Role, type RoleName } from '#enums/roles'

test.group('Enums - Roles', () => {
  test('should have correct role values', ({ assert }) => {
    assert.equal(Role.USER, 1)
    assert.equal(Role.CURATOR, 2)
    assert.equal(Role.EDITOR, 3)
    assert.equal(Role.ADMIN, 4)
  })

  test('should have correct role hierarchy order', ({ assert }) => {
    assert.isTrue(Role.USER < Role.CURATOR)
    assert.isTrue(Role.CURATOR < Role.EDITOR)
    assert.isTrue(Role.EDITOR < Role.ADMIN)
  })

  test('should include all expected roles', ({ assert }) => {
    const expectedRoles = ['USER', 'CURATOR', 'EDITOR', 'ADMIN']
    const actualRoles = Object.keys(Role).filter((key) => isNaN(Number(key)))

    assert.sameMembers(actualRoles, expectedRoles)
  })

  test('should have 4 roles total', ({ assert }) => {
    const roleCount = Object.keys(Role).filter((key) => isNaN(Number(key))).length
    assert.equal(roleCount, 4)
  })

  test('should allow role comparison for authorization logic', ({ assert }) => {
    // Test scenarios for role-based comparisons
    assert.isTrue(Role.ADMIN > Role.USER) // Admin has higher privileges than user
    assert.isTrue(Role.EDITOR >= Role.CURATOR) // Editor has equal or higher privileges than curator
    assert.isFalse(Role.USER > Role.CURATOR) // User does not have higher privileges than curator
  })

  test('should work with RoleName type', ({ assert }) => {
    const userRole: RoleName = 'USER'
    const adminRole: RoleName = 'ADMIN'

    assert.equal(userRole, 'USER')
    assert.equal(adminRole, 'ADMIN')
    assert.equal(Role[userRole], 1)
    assert.equal(Role[adminRole], 4)
  })
})
