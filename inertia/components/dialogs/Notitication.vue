<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { useForm } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps<{
  notifications: any[]
}>()

const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.readAt).length
})

const form = useForm({})

const markAsRead = (id: number) => {
  form.post(`/notifications/${id}/mark-as-read`)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="relative">
      <Bell class="h-5 w-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 h-4 w-4 text-xs bg-primary text-white rounded-full flex items-center justify-center"
      >
        {{ unreadCount }}
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-80">
      <div class="max-h-96 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-muted-foreground">
          No notifications
        </div>
        <DropdownMenuItem
          v-for="notification in notifications"
          :key="notification.id"
          @click="markAsRead(notification.id)"
          :class="{ 'bg-muted': !notification.readAt }"
        >
          <div class="flex flex-col gap-1">
            <p class="text-sm">{{ notification.data.feedbackText }}</p>
            <span class="text-xs text-muted-foreground">
              {{ new Date(notification.createdAt).toLocaleString() }}
            </span>
          </div>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>