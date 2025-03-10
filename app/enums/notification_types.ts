export enum NotificationType {
  GENERIC = 1,
  FEEDBACK_RESPONSE = 2,
  QUESTION_UPDATE = 3,
  TODAYS_QUESTION_AVAILABLE = 4,
  PAPER_SHARED = 5,
  PROGRESS_MILESTONE = 6,
}

// Map notification types to their corresponding icon names from lucide-vue-next
export const NotificationTypeIcons = {
  [NotificationType.GENERIC]: 'Bell',
  [NotificationType.FEEDBACK_RESPONSE]: 'MessageCircle',
  [NotificationType.QUESTION_UPDATE]: 'FileText',
  [NotificationType.TODAYS_QUESTION_AVAILABLE]: 'HelpCircle',
  [NotificationType.PAPER_SHARED]: 'FileText',
  [NotificationType.PROGRESS_MILESTONE]: 'CheckCircle',
}

// Human-readable labels for notification types
export const NotificationTypeLabels = {
  [NotificationType.GENERIC]: 'Notification',
  [NotificationType.FEEDBACK_RESPONSE]: 'Feedback Response',
  [NotificationType.QUESTION_UPDATE]: 'Question Updated',
  [NotificationType.TODAYS_QUESTION_AVAILABLE]: 'Daily Question',
  [NotificationType.PAPER_SHARED]: 'Paper Shared',
  [NotificationType.PROGRESS_MILESTONE]: 'Progress Milestone',
}

export default NotificationType
