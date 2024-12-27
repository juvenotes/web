import db from '@adonisjs/lucid/services/db'
import { Role } from '#enums/roles'
import hash from '@adonisjs/core/services/hash'

export async function ensureAdmin() {
  let admin = await db.from('users').where('role_id', Role.ADMIN).first()

  if (!admin) {
    const hashedPassword = await hash.make('password123')
    const [newAdmin] = await db
      .table('users')
      .insert({
        email: 'admin@example.com',
        password: hashedPassword,
        role_id: Role.ADMIN,
      })
      .returning('*')

    admin = newAdmin
  }

  return admin
}
