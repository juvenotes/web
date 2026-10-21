import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { Role } from '#enums/roles'

test.group('Metrics endpoint (functional)', () => {
  test('guest is redirected to login', async ({ client }) => {
    const response = await client.get('/manage/metrics').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('non-admin users get 404', async ({ client }) => {
    for (const roleId of [Role.USER, Role.EDITOR]) {
      const user = await UserFactory.merge({ roleId }).create()
      const response = await client.get('/manage/metrics').loginAs(user)
      response.assertStatus(404)
    }
  })

  test('legacy /metrics path is gone', async ({ client }) => {
    const admin = await UserFactory.merge({ roleId: Role.ADMIN }).create()
    const response = await client.get('/metrics').loginAs(admin)
    response.assertStatus(404)
  })

  test('admin can read metrics', async ({ client, assert }) => {
    const admin = await UserFactory.merge({ roleId: Role.ADMIN }).create()
    const response = await client.get('/manage/metrics').loginAs(admin)
    response.assertStatus(200)
    assert.include(response.header('content-type'), 'text/plain')
  })
})
