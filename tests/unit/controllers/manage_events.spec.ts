import { test } from '@japa/runner'
import ManageEventsController from '#controllers/manage/events/manage_events_controller'
import EventQuizService from '#services/event_quiz_service'
import Event from '#models/event'
import { DateTime } from 'luxon'

// Create a mock EventQuizService for testing
// Create a mock EventQuizService for testing
// Cast to EventQuizService to satisfy type, but implement stubs as needed for specific tests
const mockEventQuizService = {
  // Stub methods here if controller calls them in tested endpoints
  // e.g. deleteQuestion: async () => {},
  // createQuiz: async () => {},
} as unknown as EventQuizService

test.group('ManageEventsController (unit)', () => {
  test('index returns paginated events and meta', async ({ assert }) => {
    const originalQuery = Event.query

    const fakeEvent = { id: 1, title: 'Fake', slug: 'fake', startDate: DateTime.now() }

    const paginator = {
      all: [fakeEvent],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      firstPage: 1,
      perPage: 20,
    }

    const queryMock: any = {
      whereNull() {
        return this
      },
      orderBy() {
        return this
      },
      preload() {
        return this
      },
      where(this: any) {
        return this
      },
      paginate: async () => paginator,
    }

    Event.query = () => queryMock

    const rendered: any = {}
    const inertia = {
      render(view: string, props: any) {
        rendered.view = view
        rendered.props = props
        return {}
      },
    }

    const ctx: any = {
      inertia,
      auth: { user: { id: 1 } },
      bouncer: { with: () => ({ authorize: async () => true }) },
      logger: { info: () => { }, warn: () => { } },
      request: { input: (_key: string, def: any) => def },
    }

    const controller = new ManageEventsController(mockEventQuizService)
    await controller.index(ctx)

    assert.equal(rendered.view, 'manage/events/index')
    assert.exists(rendered.props.events)
    assert.equal(rendered.props.meta.current_page, 1)

    Event.query = originalQuery
  })

  test('index handles empty pages', async ({ assert }) => {
    const originalQuery = Event.query

    const paginator = {
      all: [],
      total: 0,
      currentPage: 100,
      lastPage: 0,
      firstPage: 1,
      perPage: 20,
    }

    const queryMock: any = {
      whereNull() {
        return this
      },
      orderBy() {
        return this
      },
      preload() {
        return this
      },
      where(this: any) {
        return this
      },
      paginate: async () => paginator,
    }

    Event.query = () => queryMock

    const rendered: any = {}
    const inertia = {
      render(view: string, props: any) {
        rendered.view = view
        rendered.props = props
        return {}
      },
    }

    const ctx: any = {
      inertia,
      auth: { user: { id: 1 } },
      bouncer: { with: () => ({ authorize: async () => true }) },
      logger: { info: () => { }, warn: () => { } },
      request: { input: (key: string, def: any) => (key === 'page' ? 100 : def) },
    }

    const controller = new ManageEventsController(mockEventQuizService)
    await controller.index(ctx)

    assert.equal(rendered.view, 'manage/events/index')
    assert.deepEqual(rendered.props.events, [])
    assert.equal(rendered.props.meta.current_page, 100)

    Event.query = originalQuery
  })
})
