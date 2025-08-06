<script setup lang="ts">
import { ref } from 'vue'
import type EventDto from '#dtos/event'
import EditEventDialog from '~/components/dialogs/EditEventDialog.vue'
import DeleteEventDialog from '~/components/dialogs/DeleteEventDialog.vue'

const props = defineProps<{ event: EventDto }>()
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

function openEditDialog() {
  showEditDialog.value = true
}
function openDeleteDialog() {
  showDeleteDialog.value = true
}
function handleEventUpdated(event: any) {
  // Optionally refresh event
}
function handleEventDeleted(eventId: number) {
  // Optionally redirect or update UI
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">{{ props.event.title }}</h2>
      <div class="flex gap-2">
        <Button variant="ghost" size="icon" @click="openEditDialog"><Edit class="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" @click="openDeleteDialog"><Trash class="h-4 w-4 text-destructive" /></Button>
      </div>
    </div>
    <div class="mb-4">
      <Badge :class="getStatusColor(props.event.status)">{{ props.event.status }}</Badge>
      <Badge :class="getEventTypeColor(props.event.type)" class="ml-2">{{ props.event.type }}</Badge>
    </div>
    <div class="mb-4 text-base">{{ props.event.description }}</div>
    <div class="mb-2 text-sm text-muted-foreground">{{ formatDate(props.event.date) }}</div>
    <div v-if="props.event.image" class="mt-2">
      <img :src="props.event.image" class="max-h-48 rounded-lg object-cover" alt="Event image" />
    </div>
    <EditEventDialog :open="showEditDialog" :event="props.event" @update:open="showEditDialog = $event" @updated="handleEventUpdated" />
    <DeleteEventDialog :open="showDeleteDialog" :event="props.event" @update:open="showDeleteDialog = $event" @deleted="handleEventDeleted" />
  </div>
</template>
