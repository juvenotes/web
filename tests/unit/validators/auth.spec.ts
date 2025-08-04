import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import {
  emailRule,
  loginValidator,
  passwordResetSendValidator,
  passwordResetValidator,
} from '#validators/auth'

test.group('Validators - Auth - Email Rule', () => {
  test('should validate valid email', async ({ assert }) => {
    const validator = vine.compile(vine.object({ email: emailRule() }))

    const result = await validator.validate({ email: 'test@example.com' })
    assert.equal(result.email, 'test@example.com')
  })

  test('should normalize email', async ({ assert }) => {
    const validator = vine.compile(vine.object({ email: emailRule() }))

    const result = await validator.validate({ email: 'TeSt@ExAmPlE.CoM' })
    assert.equal(result.email, 'test@example.com')
  })

  test('should reject invalid email format', async ({ assert }) => {
    const validator = vine.compile(vine.object({ email: emailRule() }))

    await assert.rejects(async () => await validator.validate({ email: 'invalid-email' }))
  })

  test('should reject email longer than 254 characters', async ({ assert }) => {
    const validator = vine.compile(vine.object({ email: emailRule() }))
    const longEmail = 'a'.repeat(250) + '@example.com' // > 254 chars

    await assert.rejects(async () => await validator.validate({ email: longEmail }))
  })
})

test.group('Validators - Auth - Login Validator', () => {
  test('should validate valid login data', async ({ assert }) => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
      remember: true,
    }

    const result = await loginValidator.validate(data)

    assert.equal(result.email, 'test@example.com')
    assert.equal(result.password, 'password123')
    assert.equal(result.remember, true)
  })

  test('should validate login without remember field', async ({ assert }) => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    }

    const result = await loginValidator.validate(data)

    assert.equal(result.email, 'test@example.com')
    assert.equal(result.password, 'password123')
    assert.isUndefined(result.remember)
  })

  test('should reject invalid email', async ({ assert }) => {
    const data = {
      email: 'invalid-email',
      password: 'password123',
    }

    await assert.rejects(async () => await loginValidator.validate(data))
  })

  test('should reject short password', async ({ assert }) => {
    const data = {
      email: 'test@example.com',
      password: '1234567', // 7 chars, less than minimum 8
    }

    await assert.rejects(async () => await loginValidator.validate(data))
  })

  test('should reject missing email', async ({ assert }) => {
    const data = {
      password: 'password123',
    }

    await assert.rejects(async () => await loginValidator.validate(data))
  })

  test('should reject missing password', async ({ assert }) => {
    const data = {
      email: 'test@example.com',
    }

    await assert.rejects(async () => await loginValidator.validate(data))
  })

  test('should accept password exactly 8 characters', async ({ assert }) => {
    const data = {
      email: 'test@example.com',
      password: '12345678', // exactly 8 chars
    }

    const result = await loginValidator.validate(data)
    assert.equal(result.password, '12345678')
  })
})

test.group('Validators - Auth - Password Reset Send', () => {
  test('should validate valid email for password reset', async ({ assert }) => {
    const data = { email: 'test@example.com' }

    const result = await passwordResetSendValidator.validate(data)

    assert.equal(result.email, 'test@example.com')
  })

  test('should reject invalid email', async ({ assert }) => {
    const data = { email: 'invalid-email' }

    await assert.rejects(async () => await passwordResetSendValidator.validate(data))
  })

  test('should reject missing email', async ({ assert }) => {
    const data = {}

    await assert.rejects(async () => await passwordResetSendValidator.validate(data))
  })
})

test.group('Validators - Auth - Password Reset', () => {
  test('should validate valid password reset data', async ({ assert }) => {
    const data = {
      value: 'reset-token-value',
      password: 'newpassword123',
    }

    const result = await passwordResetValidator.validate(data)

    assert.equal(result.value, 'reset-token-value')
    assert.equal(result.password, 'newpassword123')
  })

  test('should reject short password', async ({ assert }) => {
    const data = {
      value: 'reset-token',
      password: '1234567', // 7 chars
    }

    await assert.rejects(async () => await passwordResetValidator.validate(data))
  })

  test('should reject missing value', async ({ assert }) => {
    const data = {
      password: 'newpassword123',
    }

    await assert.rejects(async () => await passwordResetValidator.validate(data))
  })

  test('should reject missing password', async ({ assert }) => {
    const data = {
      value: 'reset-token',
    }

    await assert.rejects(async () => await passwordResetValidator.validate(data))
  })

  test('should accept empty string value', async ({ assert }) => {
    const data = {
      value: '',
      password: 'newpassword123',
    }

    const result = await passwordResetValidator.validate(data)
    assert.equal(result.value, '')
  })
})

// Note: Register validator tests that involve database uniqueness checks
// are excluded from pure unit tests as they require database mocking
// These would be better tested in integration tests
