<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const props = defineProps<{
  open: boolean
  event: any
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'deleted': [eventId: number]
}>()

const handleDelete = () => {
  if (!props.event?.slug) return
  useForm({}).delete(`/manage/events/${props.event.slug}`, {
    onSuccess: () => {
      emit('deleted', props.event.id)
      emit('update:open', false)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] sm:max-w-[400px] max-h-[60vh] overflow-y-auto">
      <DialogHeader
        class="bg-background/95 backdrop-blur-sm z-20 p-4 border-b max-w-screen-lg mx-auto"
      >
        <DialogTitle class="text-lg sm:text-xl text-destructive">Delete Event</DialogTitle>
      </DialogHeader>
      <div class="p-3 sm:p-6">
        <p class="mb-4 text-base">
          Are you sure you want to delete <b>{{ props.event.title }}</b
          >? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button variant="destructive" @click="handleDelete">Delete</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
