<script setup lang="ts">
// import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
// import { Bell, MessageCircle, FileText, HelpCircle, CheckCircle } from 'lucide-vue-next'
// import axios from 'axios'
// import { toast } from 'vue-sonner'
// import { NotificationTypeIcons } from '#enums/notification_types'
// import { Transmit } from '@adonisjs/transmit-client'

// // State variables
// const isOpen = ref(false)
// const notifications = ref([])
// const unreadCount = ref(0)
// const loading = ref(false)
// const isLoadingInitial = ref(true)
// const page = ref(1)
// const hasMorePages = ref(true)

// // Transmit instance for real-time updates
// const transmit = ref(null)
// const notificationSubscription = ref(null)

// // Initialize Transmit client and subscriptions
// const initializeTransmit = (userId) => {
//   // Create Transmit instance
//   transmit.value = new Transmit({
//     baseUrl: window.location.origin,
//     beforeSubscribe: (_, request) => {
//       // Add CSRF token and auth cookies to subscriptions
//       const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
//       if (csrfToken) {
//         request.headers.set('X-CSRF-TOKEN', csrfToken)
//       }
//     }
//   })

//   // Create a subscription to the user's notification channel
//   notificationSubscription.value = transmit.value.subscription(`user/${userId}`)
  
//   // Listen for notification events
//   notificationSubscription.value.create().then(() => {
//     notificationSubscription.value.onMessage((data) => {
//       // Add the new notification to the list
//       const newNotification = data
      
//       if (!notifications.value.some(n => n.id === newNotification.id)) {
//         // Add to the top of the list
//         notifications.value = [newNotification, ...notifications.value]
        
//         // Update unread count
//         unreadCount.value += 1
        
//         // Show a toast notification
//         toast(newNotification.title, {
//           description: newNotification.body || '',
//           action: {
//             label: 'View',
//             onClick: () => markAsRead(newNotification),
//           },
//         })
//       }
//     })
//   }).catch((error) => {
//     console.error('Failed to subscribe to notifications', error)
//   })
// }

// // Get notification type icon component
// const getNotificationTypeIcon = (type) => {
//   const iconName = NotificationTypeIcons[type]
//   if (!iconName) return null
  
//   // Map icon name to the imported component
//   switch (iconName) {
//     case 'Bell': return Bell
//     case 'MessageCircle': return MessageCircle
//     case 'FileText': return FileText
//     case 'HelpCircle': return HelpCircle
//     case 'CheckCircle': return CheckCircle
//     default: return null
//   }
// }

// const showBadge = computed(() => unreadCount.value > 0)

// // Handle dropdown open/close
// const handleOpenChange = (open) => {
//   isOpen.value = open
  
//   // Only fetch if opening and no notifications loaded yet
//   if (open && notifications.value.length === 0) {
//     fetchNotifications()
//   }
// }

// // Fetch notifications from API
// const fetchNotifications = async (append = false) => {
//   if (loading.value) return

//   try {
//     loading.value = true

//     if (!append) {
//       page.value = 1
//     }

//     const { data } = await axios.get('/api/notifications', {
//       params: { page: page.value, limit: 10 },
//     })

//     if (append) {
//       notifications.value = [...notifications.value, ...data.notifications]
//     } else {
//       notifications.value = data.notifications
//     }

//     hasMorePages.value = data.meta.last_page > page.value
//   } catch (error) {
//     console.error('Error fetching notifications:', error)
//     toast.error('Could not load notifications')
//   } finally {
//     loading.value = false
//     isLoadingInitial.value = false
//   }
// }

// // Load more notifications
// const loadMoreNotifications = () => {
//   if (hasMorePages.value && !loading.value) {
//     page.value++
//     fetchNotifications(true)
//   }
// }

// // Check if user has scrolled to bottom of notifications
// const handleScroll = (e) => {
//   const element = e.target
//   if (!element) return

//   const scrollPosition = element.scrollHeight - element.scrollTop - element.clientHeight
//   const threshold = 50 // pixels from bottom to trigger load

//   if (scrollPosition < threshold && hasMorePages.value && !loading.value) {
//     loadMoreNotifications()
//   }
// }

// // Fetch unread notification count
// const fetchUnreadCount = async () => {
//   try {
//     const { data } = await axios.get('/api/notifications/unread-count')
//     unreadCount.value = data.count
//   } catch (error) {
//     console.error('Error fetching unread count:', error)
//   }
// }

// // Mark a notification as read
// const markAsRead = async (notification) => {
//   try {
//     if (!notification.readAt) {
//       await axios.post(`/api/notifications/${notification.id}/read`)

//       // Update local state
//       const index = notifications.value.findIndex((n) => n.id === notification.id)
//       if (index !== -1) {
//         notifications.value[index].readAt = new Date().toISOString()
//         unreadCount.value = Math.max(0, unreadCount.value - 1)
//       }
//     }

//     // Navigate to target if href is provided
//     if (notification.href) {
//       window.location.href = notification.href
//     }
//   } catch (error) {
//     console.error('Error marking notification as read:', error)
//     toast.error('Failed to mark notification as read')
//   }
// }

// // Mark all notifications as read
// const markAllAsRead = async () => {
//   try {
//     await axios.post('/api/notifications/read-all')

//     // Update all notifications in state
//     notifications.value = notifications.value.map((notification) => ({
//       ...notification,
//       readAt: notification.readAt || new Date().toISOString(),
//     }))

//     // Reset unread count
//     unreadCount.value = 0
//     toast.success('All notifications marked as read')
//   } finally {
//     isOpen.value = false
//   }
// }

// // Lifecycle hooks
// onMounted(async () => {
//   fetchUnreadCount()
  
//   // Get current user ID
//   try {
//     const { data } = await axios.get('/api/auth/user')
//     if (data.id) {
//       initializeTransmit(data.id)
//     }
//   } catch (error) {
//     console.error('Failed to get user ID for notifications', error)
//   }
  
//   // Poll for new notifications as fallback (every minute)
//   const intervalId = setInterval(fetchUnreadCount, 60000)
  
//   onBeforeUnmount(() => {
//     clearInterval(intervalId)
    
//     // Clean up transmit subscription
//     if (notificationSubscription.value) {
//       notificationSubscription.value.delete().catch(() => {
//         // Ignore errors during cleanup
//       })
//     }
//   })
// })
</script>

<template>
 
</template>