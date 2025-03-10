import Notification from '#models/notification'

export default class NotificationCreated {
  constructor(public notification: Notification) {}
}
