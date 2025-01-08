import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

type Params = {
  user: User
}

export default class DestroyUserAccount {
  static async handle({ user }: Params) {
    await db.transaction(async (trx) => {
      user.useTransaction(trx)

      // Delete in order of dependencies
      await this.#deleteUserContent(user, trx)
      await user.delete()
    })
  }

  static async #deleteUserContent(user: User, trx: TransactionClientContract) {
    // Delete questions and their dependencies
    await trx.from('questions').where('user_id', user.id).delete()

    // Delete papers
    await trx.from('past_papers').where('user_id', user.id).delete()

    // Delete concepts
    await trx.from('concepts').where('user_id', user.id).delete()
  }
}
