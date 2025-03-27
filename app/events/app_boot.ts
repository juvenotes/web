import { BaseEvent } from '@adonisjs/core/events'

/**
 * Event dispatched when the application boots
 */
export default class AppBoot extends BaseEvent {
  constructor() {
    super()
  }
}
