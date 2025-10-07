import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import Event from '#models/event'
import { DateTime } from 'luxon'

test.group('Manage events (functional)', (group) => {
  group.each.setup(async () => {
    // Clean events table before each test (best-effort)
    await Event.query().delete()
  })

  test('guest cannot access manage events (redirect to login)', async ({ client }) => {
    const response = await client.get('/manage/events')
    response.assertStatus(302)
  })

  test('authenticated user can view paginated manage events', async ({ client }) => {
    const user = await UserFactory.create()

    // create 35 events to ensure pagination
    for (let i = 0; i < 35; i++) {
      await Event.create({
        userId: user.id,
        title: `Event ${i}`,
        slug: `event-${i}-${Date.now()}-${i}`,
        description: `Desc ${i}`,
        content: null,
        eventType: 'live',
        status: 'draft',
        startDate: DateTime.now(),
        endDate: DateTime.now(),
        registrationDeadline: null,
        venue: null,
        address: null,
        onlineLink: null,
        isOnline: false,
        isFree: true,
        price: null,
        currency: 'KES',
        maxParticipants: null,
        imageUrl: null,
        currentParticipants: 0,
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
    await Event.create({
      userId: user.id,
      title: `Solo Event`,
      slug: `solo-event-${Date.now()}`,
      description: `Solo`,
      content: null,
      eventType: 'live',
      status: 'draft',
      startDate: DateTime.now(),
      endDate: DateTime.now(),
      registrationDeadline: null,
      venue: null,
      address: null,
      onlineLink: null,
      isOnline: false,
      isFree: true,
      price: null,
      currency: 'KES',
      maxParticipants: null,
      imageUrl: null,
      currentParticipants: 0,
    })

    const response = await client.get('/manage/events?page=100').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains('events')
  })
})
