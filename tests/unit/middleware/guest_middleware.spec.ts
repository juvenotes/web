import { test } from '@japa/runner'
import GuestMiddleware from '#middleware/guest_middleware'

test.group('Middleware - Guest Middleware', () => {
  test('should call next when user is not authenticated', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    let nextCalled = false

    const mockCtx = {
      auth: {
        defaultGuard: 'web',
        use: (guard: string) => ({
          check: async () => false, // User is not authenticated
        }),
      },
      response: {
        redirect: () => {},
      },
    } as any

    const mockNext = async () => {
      nextCalled = true
      return 'next-result'
    }

    const result = await middleware.handle(mockCtx, mockNext)

    assert.isTrue(nextCalled)
    assert.equal(result, 'next-result')
  })

  test('should redirect when user is authenticated with default guard', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    let redirectCalled = false
    let redirectUrl: string
    let redirectStatus: boolean

    const mockCtx = {
      auth: {
        defaultGuard: 'web',
        use: (guard: string) => ({
          check: async () => true, // User is authenticated
        }),
      },
      response: {
        redirect: (url: string, status: boolean) => {
          redirectCalled = true
          redirectUrl = url
          redirectStatus = status
          return 'redirect-response'
        },
      },
    } as any

    const mockNext = async () => 'next-result'

    const result = await middleware.handle(mockCtx, mockNext)

    assert.isTrue(redirectCalled)
    assert.equal(redirectUrl, '/')
    assert.isTrue(redirectStatus)
    assert.equal(result, 'redirect-response')
  })

  test('should use default redirectTo URL', ({ assert }) => {
    const middleware = new GuestMiddleware()

    assert.equal(middleware.redirectTo, '/')
  })

  test('should check specified guards', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    const checkedGuards: string[] = []

    const mockCtx = {
      auth: {
        defaultGuard: 'web',
        use: (guard: string) => {
          checkedGuards.push(guard)
          return {
            check: async () => false, // Not authenticated for any guard
          }
        },
      },
      response: {
        redirect: () => 'redirect-response',
      },
    } as any

    const mockNext = async () => 'next-result'
    const options = { guards: ['web', 'api'] }

    await middleware.handle(mockCtx, mockNext, options)

    assert.deepEqual(checkedGuards, ['web', 'api'])
  })

  test('should redirect on first authenticated guard', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    const checkedGuards: string[] = []
    let redirectCalled = false

    const mockCtx = {
      auth: {
        defaultGuard: 'web',
        use: (guard: string) => {
          checkedGuards.push(guard)
          return {
            check: async () => guard === 'web', // Only web guard is authenticated
          }
        },
      },
      response: {
        redirect: () => {
          redirectCalled = true
          return 'redirect-response'
        },
      },
    } as any

    const mockNext = async () => 'next-result'
    const options = { guards: ['web', 'api'] }

    const result = await middleware.handle(mockCtx, mockNext, options)

    assert.deepEqual(checkedGuards, ['web']) // Should stop at first authenticated guard
    assert.isTrue(redirectCalled)
    assert.equal(result, 'redirect-response')
  })

  test('should continue to next when all guards are unauthenticated', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    let nextCalled = false

    const mockCtx = {
      auth: {
        defaultGuard: 'web',
        use: (guard: string) => ({
          check: async () => false, // All guards are unauthenticated
        }),
      },
      response: {
        redirect: () => 'redirect-response',
      },
    } as any

    const mockNext = async () => {
      nextCalled = true
      return 'next-result'
    }
    const options = { guards: ['web', 'api'] }

    const result = await middleware.handle(mockCtx, mockNext, options)

    assert.isTrue(nextCalled)
    assert.equal(result, 'next-result')
  })

  test('should use default guard when no guards specified', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    const checkedGuards: string[] = []

    const mockCtx = {
      auth: {
        defaultGuard: 'session',
        use: (guard: string) => {
          checkedGuards.push(guard)
          return {
            check: async () => false,
          }
        },
      },
      response: {
        redirect: () => 'redirect-response',
      },
    } as any

    const mockNext = async () => 'next-result'

    await middleware.handle(mockCtx, mockNext)

    assert.deepEqual(checkedGuards, ['session'])
  })

  test('should handle empty guards array by iterating over empty array', async ({ assert }) => {
    const middleware = new GuestMiddleware()
    const checkedGuards: string[] = []
    let nextCalled = false

    const mockCtx = {
      auth: {
        defaultGuard: 'default',
        use: (guard: string) => {
          checkedGuards.push(guard)
          return {
            check: async () => false,
          }
        },
      },
      response: {
        redirect: () => 'redirect-response',
      },
    } as any

    const mockNext = async () => {
      nextCalled = true
      return 'next-result'
    }
    const options = { guards: [] }

    await middleware.handle(mockCtx, mockNext, options)

    // Empty guards array means no guards are checked, so it goes straight to next()
    assert.deepEqual(checkedGuards, [])
    assert.isTrue(nextCalled)
  })
})
