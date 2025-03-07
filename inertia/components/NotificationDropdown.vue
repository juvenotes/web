<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { Bell, MessageCircle, FileText, HelpCircle, CheckCircle } from 'lucide-vue-next'
import axios from 'axios'
import { toast } from 'vue-sonner'
import { NotificationTypeIcons } from '#enums/notification_types'

const isOpen = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const isLoadingInitial = ref(true)
const page = ref(1)
const hasMorePages = ref(true)

// Get notification type icon component
const getNotificationTypeIcon = (type) => {
  const iconName = NotificationTypeIcons[type]
  if (!iconName) return null
  
  // Map icon name to the imported component
  switch (iconName) {
    case 'Bell': return Bell
    case 'MessageCircle': return MessageCircle
    case 'FileText': return FileText
    case 'HelpCircle': return HelpCircle
    case 'CheckCircle': return CheckCircle
    default: return null
  }
}

const showBadge = computed(() => unreadCount.value > 0)

// Handle dropdown open/close
const handleOpenChange = (open) => {
  isOpen.value = open
  
  // Only fetch if opening and no notifications loaded yet
  if (open && notifications.value.length === 0) {
    fetchNotifications()
  }
}

// Fetch notifications from API
const fetchNotifications = async (append = false) => {
  if (loading.value) return

  try {
    loading.value = true

    if (!append) {
      page.value = 1
    }

    const { data } = await axios.get('/api/notifications', {
      params: { page: page.value, limit: 10 },
    })

    if (append) {
      notifications.value = [...notifications.value, ...data.notifications]
    } else {
      notifications.value = data.notifications
    }

    hasMorePages.value = data.meta.last_page > page.value
  } catch (error) {
    console.error('Error fetching notifications:', error)
    toast.error('Could not load notifications')
  } finally {
    loading.value = false
    isLoadingInitial.value = false
  }
}

// Load more notifications
const loadMoreNotifications = () => {
  if (hasMorePages.value && !loading.value) {
    page.value++
    fetchNotifications(true)
  }
}

// Check if user has scrolled to bottom of notifications
const handleScroll = (e) => {
  const element = e.target
  if (!element) return

  const scrollPosition = element.scrollHeight - element.scrollTop - element.clientHeight
  const threshold = 50 // pixels from bottom to trigger load

  if (scrollPosition < threshold && hasMorePages.value && !loading.value) {
    loadMoreNotifications()
  }
}

// Fetch unread notification count
const fetchUnreadCount = async () => {
  try {
    const { data } = await axios.get('/api/notifications/unread-count')
    unreadCount.value = data.count
  } catch (error) {
    console.error('Error fetching unread count:', error)
  }
}

// Mark a notification as read
const markAsRead = async (notification) => {
  try {
    if (!notification.readAt) {
      await axios.post(`/api/notifications/${notification.id}/read`)

      // Update local state
      const index = notifications.value.findIndex((n) => n.id === notification.id)
      if (index !== -1) {
        notifications.value[index].readAt = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }

    // Navigate to target if href is provided
    if (notification.href) {
      window.location.href = notification.href
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    toast.error('Failed to mark notification as read')
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    await axios.post('/api/notifications/read-all')

    // Update all notifications in state
    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      readAt: notification.readAt || new Date().toISOString(),
    }))

    // Reset unread count
    unreadCount.value = 0
    toast.success('All notifications marked as read')
  } finally {
    isOpen.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchUnreadCount()
  
  // Poll for new notifications every minute
  const intervalId = setInterval(fetchUnreadCount, 60000)
  
  onBeforeUnmount(() => {
    clearInterval(intervalId)
  })
})
</script>

<template>
  <div>
    <DropdownMenu :open="isOpen" @update:open="handleOpenChange">
      <DropdownMenuTrigger as-child>
        <Button 
          variant="ghost" 
          size="icon" 
          class="relative rounded-full hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="showBadge"
            class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
          <span class="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent class="w-80 sm:w-96" align="end">
        <div class="px-4 py-3 flex items-center justify-between sticky top-0 bg-background z-10 border-b">
          <h3 class="text-sm font-semibold">Notifications</h3>
          <Button
            v-if="!isLoadingInitial && notifications.length > 0 && unreadCount > 0"
            variant="ghost"
            size="sm"
            @click="markAllAsRead"
          >
            Mark all as read
          </Button>
        </div>

        <!-- Loading state -->
        <div v-if="isLoadingInitial" class="flex justify-center py-4">
          <div class="space-y-2 w-[90%]">
            <Skeleton class="h-12 w-full rounded-md" />
            <Skeleton class="h-12 w-full rounded-md" />
            <Skeleton class="h-12 w-full rounded-md" />
          </div>
        </div>

        <!-- Notifications list -->
        <div
          v-else-if="notifications.length > 0"
          class="max-h-[calc(80vh-100px)] sm:max-h-96 overflow-y-auto"
          @scroll="handleScroll"
        >
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0"
            :class="{ 'bg-muted/20': !notification.readAt }"
            @click="markAsRead(notification)"
          >
            <div class="flex gap-3">
              <!-- Unread indicator dot -->
              <div
                v-if="!notification.readAt"
                class="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0"
              ></div>

              <!-- Type-specific icon (optional) -->
              <div
                v-if="getNotificationTypeIcon(notification.notificationType)"
                class="flex-shrink-0"
              >
                <component
                  :is="getNotificationTypeIcon(notification.notificationType)"
                  class="w-4 h-4 mt-1 text-muted-foreground"
                />
              </div>

              <!-- Notification content -->
              <div class="flex-1">
                <div class="text-sm font-medium">{{ notification.title }}</div>
                <div v-if="notification.body" class="text-sm text-muted-foreground mt-1">
                  {{ notification.body }}
                </div>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-xs text-muted-foreground">
                    {{ notification.timeAgo }}
                  </p>
                  <p v-if="notification.initiator" class="text-xs text-muted-foreground">
                    by {{ notification.initiator.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading more indicator -->
          <div v-if="loading && !isLoadingInitial" class="flex justify-center py-3">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="px-4 py-8 text-center">
          <p class="text-muted-foreground">No notifications yet</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>