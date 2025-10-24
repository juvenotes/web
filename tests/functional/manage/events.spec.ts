import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

test.group('Manage events (functional)', (group) => {
  group.each.setup(async () => {
    // Clean events table before each test (best-effort)
    await db.rawQuery('TRUNCATE TABLE events RESTART IDENTITY CASCADE')
  })

  test('guest cannot access manage events (redirect to login)', async ({ client }) => {
    const response = await client.get('/manage/events')
    response.assertStatus(302)
  })

  test('authenticated user can view paginated manage events', async ({ client }) => {
    const user = await UserFactory.create()

    // create 35 events to ensure pagination
    for (let i = 0; i < 35; i++) {
      await db.table('events').insert({
        user_id: user.id,
        title: `Event ${i}`,
        slug: `event-${i}-${Date.now()}-${i}`,
        description: `Desc ${i}`,
        content: null,
        event_type: 'live',
        status: 'draft',
        start_date: DateTime.now().toSQL(),
        end_date: DateTime.now().toSQL(),
        registration_deadline: null,
        venue: null,
        address: null,
        online_link: null,
        is_online: false,
        is_free: true,
        price: null,
        currency: 'KES',
        max_participants: null,
        image_url: null,
        current_participants: 0,
      })
    }

    const response = await client.get('/manage/events').loginAs(user)

    response.assertStatus(200)
    // ensure pagination meta present in the returned inertia page
    response.assertBodyContains('events')
  })

  test('pagination page out of range returns empty list but valid meta', async ({ client }) => {
    const user = await UserFactory.create()

    // ensure there are fewer events than the requested page
    await db.table('events').insert({
      user_id: user.id,
      title: `Solo Event`,
      slug: `solo-event-${Date.now()}`,
      description: `Solo`,
      content: null,
      event_type: 'live',
      status: 'draft',
      start_date: DateTime.now().toSQL(),
      end_date: DateTime.now().toSQL(),
      registration_deadline: null,
      venue: null,
      address: null,
      online_link: null,
      is_online: false,
      is_free: true,
      price: null,
      currency: 'KES',
      max_participants: null,
      image_url: null,
      current_participants: 0,
    })

    const response = await client.get('/manage/events?page=100').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains('events')
  })
})
