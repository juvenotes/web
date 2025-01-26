import { Exception } from '@adonisjs/core/exceptions'

export default class NotAllowedException extends Exception {
  constructor(message: string = "You don't have permission to access this resource") {
    super(message, {
      status: 403,
      code: 'E_NOT_ALLOWED_EXCEPTION',
      // Add additional context if needed
      // redirectTo: '/custom-redirect-path'
    })
  }
}
