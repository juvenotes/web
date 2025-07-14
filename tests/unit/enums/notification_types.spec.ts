import { test } from '@japa/runner'
import {
  NotificationType,
  NotificationTypeIcons,
  NotificationTypeLabels
} from '#enums/notification_types'

test.group('Enums - Notification Types', () => {
  test('should have correct notification type values', ({ assert }) => {
    assert.equal(NotificationType.GENERIC, 1)
    assert.equal(NotificationType.FEEDBACK_RESPONSE, 2)
    assert.equal(NotificationType.QUESTION_UPDATE, 3)
    assert.equal(NotificationType.TODAYS_QUESTION_AVAILABLE, 4)
    assert.equal(NotificationType.PAPER_SHARED, 5)
    assert.equal(NotificationType.PROGRESS_MILESTONE, 6)
  })

  test('should have icons for all notification types', ({ assert }) => {
    assert.equal(NotificationTypeIcons[NotificationType.GENERIC], 'Bell')
    assert.equal(NotificationTypeIcons[NotificationType.FEEDBACK_RESPONSE], 'MessageCircle')
    assert.equal(NotificationTypeIcons[NotificationType.QUESTION_UPDATE], 'FileText')
    assert.equal(NotificationTypeIcons[NotificationType.TODAYS_QUESTION_AVAILABLE], 'HelpCircle')
    assert.equal(NotificationTypeIcons[NotificationType.PAPER_SHARED], 'FileText')
    assert.equal(NotificationTypeIcons[NotificationType.PROGRESS_MILESTONE], 'CheckCircle')
  })

  test('should have labels for all notification types', ({ assert }) => {
    assert.equal(NotificationTypeLabels[NotificationType.GENERIC], 'Notification')
    assert.equal(NotificationTypeLabels[NotificationType.FEEDBACK_RESPONSE], 'Feedback Response')
    assert.equal(NotificationTypeLabels[NotificationType.QUESTION_UPDATE], 'Question Updated')
    assert.equal(NotificationTypeLabels[NotificationType.TODAYS_QUESTION_AVAILABLE], 'Daily Question')
    assert.equal(NotificationTypeLabels[NotificationType.PAPER_SHARED], 'Paper Shared')
    assert.equal(NotificationTypeLabels[NotificationType.PROGRESS_MILESTONE], 'Progress Milestone')
  })

  test('should have icon mapping for every notification type', ({ assert }) => {
    const notificationTypes = Object.values(NotificationType).filter(value => typeof value === 'number')
    
    for (const type of notificationTypes) {
      assert.isDefined(NotificationTypeIcons[type as NotificationType], `Icon missing for notification type ${type}`)
      assert.isString(NotificationTypeIcons[type as NotificationType])
    }
  })

  test('should have label mapping for every notification type', ({ assert }) => {
    const notificationTypes = Object.values(NotificationType).filter(value => typeof value === 'number')
    
    for (const type of notificationTypes) {
      assert.isDefined(NotificationTypeLabels[type as NotificationType], `Label missing for notification type ${type}`)
      assert.isString(NotificationTypeLabels[type as NotificationType])
      assert.isAbove(NotificationTypeLabels[type as NotificationType].length, 0)
    }
  })

  test('should have consistent icon naming convention', ({ assert }) => {
    const iconValues = Object.values(NotificationTypeIcons)
    
    for (const icon of iconValues) {
      // Icons should be PascalCase (Lucide icon naming convention)
      assert.match(icon, /^[A-Z][a-zA-Z]*$/, `Icon "${icon}" should be PascalCase`)
    }
  })

  test('should have meaningful labels', ({ assert }) => {
    const labelValues = Object.values(NotificationTypeLabels)
    
    for (const label of labelValues) {
      // Labels should not be empty and should start with capital letter
      assert.isAbove(label.length, 0)
      assert.match(label[0], /[A-Z]/, `Label "${label}" should start with capital letter`)
    }
  })

  test('should have same number of types, icons, and labels', ({ assert }) => {
    const typeCount = Object.values(NotificationType).filter(value => typeof value === 'number').length
    const iconCount = Object.keys(NotificationTypeIcons).length
    const labelCount = Object.keys(NotificationTypeLabels).length
    
    assert.equal(typeCount, iconCount, 'Number of types should match number of icons')
    assert.equal(typeCount, labelCount, 'Number of types should match number of labels')
    assert.equal(iconCount, labelCount, 'Number of icons should match number of labels')
  })

  test('should support type-safe usage', ({ assert }) => {
    // Test that we can use the enum values safely
    const feedbackType = NotificationType.FEEDBACK_RESPONSE
    const icon = NotificationTypeIcons[feedbackType]
    const label = NotificationTypeLabels[feedbackType]
    
    assert.equal(feedbackType, 2)
    assert.equal(icon, 'MessageCircle')
    assert.equal(label, 'Feedback Response')
  })
})