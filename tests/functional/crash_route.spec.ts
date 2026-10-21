import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { Role } from '#enums/roles'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Crash route (functional)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('guest is redirected to login', async ({ client }) => {
    const response = await client.get('/crash').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('non-admin users get 404', async ({ client }) => {
    for (const roleId of [Role.USER, Role.EDITOR]) {
      const user = await UserFactory.merge({ roleId }).create()
      const response = await client.get('/crash').loginAs(user)
      response.assertStatus(404)
    }
  })

  test('admin triggers a 500', async ({ client }) => {
    const admin = await UserFactory.merge({ roleId: Role.ADMIN }).create()
    const response = await client.get('/crash').loginAs(admin)
    response.assertStatus(500)
  })
})
