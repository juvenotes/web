import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Event from '#models/event'
import User from '#models/user'
import Role from '#models/role'

test.group('Event Model', (group) => {
  group.setup(async () => {
    // Setup test data if needed
  })

  test('should create an event with all required fields', async ({ assert }) => {
    // Create a test user first
    const role = await Role.create({
      name: 'Admin',
      description: 'Administrator role',
    })

    const user = await User.create({
      roleId: role.id,
      email: 'test@example.com',
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
      countryCode: 'US',
    })

    const eventData = {
      userId: user.id,
      title: 'Test Event',
      slug: 'test-event',
      description: 'This is a test event',
      eventType: 'webinar',
      status: 'draft',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      isOnline: true,
      isFree: true,
      currency: 'USD',
      currentParticipants: 0,
      metadata: {},
    }

    const event = await Event.create(eventData)

    assert.equal(event.title, 'Test Event')
    assert.equal(event.slug, 'test-event')
    assert.equal(event.eventType, 'webinar')
    assert.equal(event.status, 'draft')
    assert.equal(event.isOnline, true)
    assert.equal(event.isFree, true)
    assert.equal(event.currentParticipants, 0)
    assert.isNotNull(event.id)
    assert.isNotNull(event.createdAt)
    assert.isNotNull(event.updatedAt)
  })

  test('should soft delete an event', async ({ assert }) => {
    const role = await Role.create({
      name: 'Admin',
      description: 'Administrator role',
    })

    const user = await User.create({
      roleId: role.id,
      email: 'test2@example.com',
      fullName: 'Test User 2',
      username: 'testuser2',
      password: 'password123',
      countryCode: 'US',
    })

    const event = await Event.create({
      userId: user.id,
      title: 'Event to Delete',
      slug: 'event-to-delete',
      eventType: 'workshop',
      status: 'draft',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      isOnline: false,
      isFree: true,
      currency: 'USD',
      currentParticipants: 0,
      metadata: {},
    })

    assert.isNull(event.deletedAt)

    await event.delete()

    assert.isNotNull(event.deletedAt)
    assert.instanceOf(event.deletedAt, DateTime)
  })

  test('should load user relationship', async ({ assert }) => {
    const role = await Role.create({
      name: 'Admin',
      description: 'Administrator role',
    })

    const user = await User.create({
      roleId: role.id,
      email: 'test3@example.com',
      fullName: 'Test User 3',
      username: 'testuser3',
      password: 'password123',
      countryCode: 'US',
    })

    const event = await Event.create({
      userId: user.id,
      title: 'Event with User',
      slug: 'event-with-user',
      eventType: 'conference',
      status: 'published',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 8 }),
      isOnline: false,
      isFree: false,
      price: 99.99,
      currency: 'USD',
      currentParticipants: 0,
      metadata: {},
    })

    await event.load('user')

    assert.isNotNull(event.user)
    assert.equal(event.user.email, 'test3@example.com')
    assert.equal(event.user.fullName, 'Test User 3')
  })
})