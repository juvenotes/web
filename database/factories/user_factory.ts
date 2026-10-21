import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { generateUsername } from '#utils/generate_username'

export const UserFactory = factory
  .define(User, ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: 'password123',
      fullName: faker.person.fullName(),
      // Suffix keeps usernames unique; generateUsername() alone has ~660 combinations
      // without a number and collides across test runs.
      username: `${generateUsername({ useNumber: false })}-${faker.string.alphanumeric({ length: 8, casing: 'lower' })}`,
    }
  })
  .build()
