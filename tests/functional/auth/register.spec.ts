import { test } from '@japa/runner'
import { Role } from '#enums/roles'
import User from '#models/user'

test.group('Auth register', () => {
  test('should show register page', async ({ client }) => {
    const response = await client.get('/register')
    response.assertStatus(200)
  })

  test('can register with valid data', async ({ client, assert }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'test@example.com',
        password: 'password123',
        role_id: Role.USER,
      })
      .withCsrfToken()

    console.log(response.status)
    response.assertStatus(201)
    response.assertRedirectsTo('/')

    const user = await User.findBy('email', 'test@example.com')
    console.log(user)
    assert.exists(user)

    response.assertSession('success', `Welcome to TestApp`)
  })

  test('cannot register with invalid email', async ({ client }) => {
    const response = await client.post('/register').json({
      email: 'invalid-email',
      password: 'password123',
      role_id: Role.USER,
    })

    response.assertStatus(400)
    response.assertBodyContains({ errors: { email: 'Invalid email format' } })
  })

  test('cannot register with existing email', async ({ client }) => {
    await User.create({
      email: 'exists@example.com',
      password: 'password123',
      role_id: Role.USER,
    })

    const response = await client.post('/register').json({
      email: 'exists@example.com',
      password: 'password123',
      role_id: Role.USER,
    })

    response.assertStatus(400)
    response.assertBodyContains({ errors: { email: 'Email already in use' } })
  })

  test('cannot register with short password', async ({ client }) => {
    const response = await client.post('/register').json({
      email: 'test@example.com',
      password: '123',
      role_id: Role.USER,
    })

    response.assertStatus(400)
    response.assertBodyContains({ errors: { password: 'Password too short' } })
  })

  test('session has success message after registration', async ({ client }) => {
    const response = await client.post('/register').json({
      email: 'test@example.com',
      password: 'password123',
      role_id: Role.USER,
    })

    response.assertStatus(302)
    response.assertRedirectTo('/')
    response.assertSession('success', 'Registration successful')
  })
})
