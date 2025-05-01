import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { generateUsername } from '#utils/generate_username'

export const UserFactory = factory
  .define(User, ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: 'password123',
      fullName: faker.person.fullName(),
      username: generateUsername(), // Adding username field to fix the NOT NULL constraint
    }
  })
  .build()
