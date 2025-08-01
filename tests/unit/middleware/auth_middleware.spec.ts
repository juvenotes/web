import { test } from '@japa/runner'
import AuthMiddleware from '#middleware/auth_middleware'
import { errors } from '@adonisjs/auth'
import { SESSION_KEYS } from '#constants/session'

test.group('Middleware - Auth Middleware', () => {
  test('should call next when authentication succeeds', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    let nextCalled = false
    
    const mockCtx = {
      auth: {
        authenticateUsing: async () => {
          // Mock successful authentication
          return true
        }
      },
      session: {
        put: () => {}
      },
      request: {
        url: () => '/test'
      }
    } as any
    
    const mockNext = async () => {
      nextCalled = true
      return 'next-result'
    }
    
    const result = await middleware.handle(mockCtx, mockNext)
    
    assert.isTrue(nextCalled)
    assert.equal(result, 'next-result')
  })

  test('should use default redirectTo URL', ({ assert }) => {
    const middleware = new AuthMiddleware()
    
    assert.equal(middleware.redirectTo, '/login')
  })

  test('should pass guards to authenticateUsing', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    let passedGuards: any
    let passedOptions: any
    
    const mockCtx = {
      auth: {
        authenticateUsing: async (guards: any, options: any) => {
          passedGuards = guards
          passedOptions = options
          return true
        }
      },
      session: {
        put: () => {}
      },
      request: {
        url: () => '/test'
      }
    } as any
    
    const mockNext = async () => 'next-result'
    const options = { guards: ['web', 'api'] }
    
    await middleware.handle(mockCtx, mockNext, options)
    
    assert.deepEqual(passedGuards, ['web', 'api'])
    assert.deepEqual(passedOptions, { loginRoute: '/login' })
  })

  test('should handle empty guards option', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    let passedGuards: any
    
    const mockCtx = {
      auth: {
        authenticateUsing: async (guards: any) => {
          passedGuards = guards
          return true
        }
      },
      session: {
        put: () => {}
      },
      request: {
        url: () => '/test'
      }
    } as any
    
    const mockNext = async () => 'next-result'
    
    await middleware.handle(mockCtx, mockNext, {})
    
    assert.isUndefined(passedGuards)
  })

  test('should store return URL when unauthorized access error occurs', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    let storedKey: string | undefined
    let storedValue: string | undefined
    const testUrl = '/protected-page?param=value'
    
    const mockCtx = {
      auth: {
        authenticateUsing: async () => {
          // Create a proper E_UNAUTHORIZED_ACCESS error
          throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized', {
            guardDriverName: 'session',
            guards: ['session']
          })
        }
      },
      session: {
        put: (key: string, value: string) => {
          storedKey = key
          storedValue = value
        }
      },
      request: {
        url: (withQueryString: boolean) => {
          return testUrl
        }
      }
    } as any
    
    const mockNext = async () => 'next-result'
    
    try {
      await middleware.handle(mockCtx, mockNext)
      assert.fail('Expected middleware to throw error')
    } catch (error) {
      // Error should be thrown, which is expected
      assert.instanceOf(error, errors.E_UNAUTHORIZED_ACCESS)
    }
    
    assert.equal(storedKey, SESSION_KEYS.RETURN_TO)
    assert.equal(storedValue, testUrl)
  })

  test('should not store return URL for non-unauthorized errors', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    let sessionPutCalled = false
    
    const mockCtx = {
      auth: {
        authenticateUsing: async () => {
          throw new Error('Some other error')
        }
      },
      session: {
        put: () => {
          sessionPutCalled = true
        }
      },
      request: {
        url: () => '/test'
      }
    } as any
    
    const mockNext = async () => 'next-result'
    
    await assert.rejects(
      async () => await middleware.handle(mockCtx, mockNext),
      'Some other error'
    )
    
    assert.isFalse(sessionPutCalled)
  })

  test('should rethrow authentication errors', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    
    const mockCtx = {
      auth: {
        authenticateUsing: async () => {
          const error = new errors.E_UNAUTHORIZED_ACCESS('Authentication failed')
          Object.assign(error, { guardDriverName: 'session' })
          throw error
        }
      },
      session: {
        put: () => {}
      },
      request: {
        url: () => '/test'
      }
    } as any
    
    const mockNext = async () => 'next-result'
    
    await assert.rejects(
      async () => await middleware.handle(mockCtx, mockNext)
    )
  })

  test('should rethrow non-authentication errors', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    
    const mockCtx = {
      auth: {
        authenticateUsing: async () => {
          throw new Error('Database connection failed')
        }
      },
      session: {
        put: () => {}
      },
      request: {
        url: () => '/test'
      }
    } as any
    
    const mockNext = async () => 'next-result'
    
    await assert.rejects(
      async () => await middleware.handle(mockCtx, mockNext),
      'Database connection failed'
    )
  })
})