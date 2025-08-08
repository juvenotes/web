import { test } from '@japa/runner'
import UserPolicy from '#policies/user_policy'
import { Role } from '#enums/roles'

test.group('Policies - User Policy - View', () => {
  test('should allow admin to view users', ({ assert }) => {
    const policy = new UserPolicy()
    const adminUser = { roleId: Role.ADMIN } as any

    const result = policy.view(adminUser)

    assert.isTrue(result)
  })

  test('should deny non-admin user to view users', ({ assert }) => {
    const policy = new UserPolicy()
    const regularUser = { roleId: Role.USER } as any

    const result = policy.view(regularUser)

    assert.isFalse(result)
  })

  test('should deny curator to view users', ({ assert }) => {
    const policy = new UserPolicy()
    const curatorUser = { roleId: Role.CURATOR } as any

    const result = policy.view(curatorUser)

    assert.isFalse(result)
  })

  test('should deny editor to view users', ({ assert }) => {
    const policy = new UserPolicy()
    const editorUser = { roleId: Role.EDITOR } as any

    const result = policy.view(editorUser)

    assert.isFalse(result)
  })

  test('should deny null user to view users', ({ assert }) => {
    const policy = new UserPolicy()

    const result = policy.view(null)

    assert.isFalse(result)
  })
})

test.group('Policies - User Policy - Create', () => {
  test('should allow admin to create users', ({ assert }) => {
    const policy = new UserPolicy()
    const adminUser = { roleId: Role.ADMIN } as any

    const result = policy.create(adminUser)

    assert.isTrue(result)
  })

  test('should deny non-admin user to create users', ({ assert }) => {
    const policy = new UserPolicy()
    const regularUser = { roleId: Role.USER } as any

    const result = policy.create(regularUser)

    assert.isFalse(result)
  })

  test('should deny curator to create users', ({ assert }) => {
    const policy = new UserPolicy()
    const curatorUser = { roleId: Role.CURATOR } as any

    const result = policy.create(curatorUser)

    assert.isFalse(result)
  })

  test('should deny editor to create users', ({ assert }) => {
    const policy = new UserPolicy()
    const editorUser = { roleId: Role.EDITOR } as any

    const result = policy.create(editorUser)

    assert.isFalse(result)
  })
})

test.group('Policies - User Policy - Update', () => {
  test('should allow admin to update any user', ({ assert }) => {
    const policy = new UserPolicy()
    const adminUser = { id: 1, roleId: Role.ADMIN } as any
    const targetUser = { id: 2, roleId: Role.USER } as any

    const result = policy.update(adminUser, targetUser)

    assert.isTrue(result)
  })

  test('should allow user to update their own profile', ({ assert }) => {
    const policy = new UserPolicy()
    const user = { id: 1, roleId: Role.USER } as any
    const sameUser = { id: 1, roleId: Role.USER } as any

    const result = policy.update(user, sameUser)

    assert.isTrue(result)
  })

  test('should deny user to update other user profile', ({ assert }) => {
    const policy = new UserPolicy()
    const user = { id: 1, roleId: Role.USER } as any
    const otherUser = { id: 2, roleId: Role.USER } as any

    const result = policy.update(user, otherUser)

    assert.isFalse(result)
  })

  test('should allow curator to update their own profile', ({ assert }) => {
    const policy = new UserPolicy()
    const curator = { id: 1, roleId: Role.CURATOR } as any
    const sameCurator = { id: 1, roleId: Role.CURATOR } as any

    const result = policy.update(curator, sameCurator)

    assert.isTrue(result)
  })

  test('should deny curator to update other user profile', ({ assert }) => {
    const policy = new UserPolicy()
    const curator = { id: 1, roleId: Role.CURATOR } as any
    const otherUser = { id: 2, roleId: Role.USER } as any

    const result = policy.update(curator, otherUser)

    assert.isFalse(result)
  })

  test('should allow editor to update their own profile', ({ assert }) => {
    const policy = new UserPolicy()
    const editor = { id: 1, roleId: Role.EDITOR } as any
    const sameEditor = { id: 1, roleId: Role.EDITOR } as any

    const result = policy.update(editor, sameEditor)

    assert.isTrue(result)
  })

  test('should deny editor to update other user profile', ({ assert }) => {
    const policy = new UserPolicy()
    const editor = { id: 1, roleId: Role.EDITOR } as any
    const otherUser = { id: 2, roleId: Role.USER } as any

    const result = policy.update(editor, otherUser)

    assert.isFalse(result)
  })
})

test.group('Policies - User Policy - Delete', () => {
  test('should allow admin to delete users', ({ assert }) => {
    const policy = new UserPolicy()
    const adminUser = { id: 1, roleId: Role.ADMIN } as any
    const targetUser = { id: 2, roleId: Role.USER } as any

    const result = policy.delete(adminUser, targetUser)

    assert.isTrue(result)
  })

  test('should deny non-admin user to delete users', ({ assert }) => {
    const policy = new UserPolicy()
    const regularUser = { id: 1, roleId: Role.USER } as any
    const targetUser = { id: 2, roleId: Role.USER } as any

    const result = policy.delete(regularUser, targetUser)

    assert.isFalse(result)
  })

  test('should deny curator to delete users', ({ assert }) => {
    const policy = new UserPolicy()
    const curatorUser = { id: 1, roleId: Role.CURATOR } as any
    const targetUser = { id: 2, roleId: Role.USER } as any

    const result = policy.delete(curatorUser, targetUser)

    assert.isFalse(result)
  })

  test('should deny editor to delete users', ({ assert }) => {
    const policy = new UserPolicy()
    const editorUser = { id: 1, roleId: Role.EDITOR } as any
    const targetUser = { id: 2, roleId: Role.USER } as any

    const result = policy.delete(editorUser, targetUser)

    assert.isFalse(result)
  })

  test('should deny user to delete themselves', ({ assert }) => {
    const policy = new UserPolicy()
    const user = { id: 1, roleId: Role.USER } as any
    const sameUser = { id: 1, roleId: Role.USER } as any

    const result = policy.delete(user, sameUser)

    assert.isFalse(result)
  })
})
