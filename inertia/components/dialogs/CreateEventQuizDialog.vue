<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useForm } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'

const props = defineProps<{
  open: boolean
  event: EventDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  description: '',
})

function handleSubmit() {
  form.post(`/manage/events/${props.event.slug}/quiz`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
    onError: (errors) => {
      console.error('Form errors:', errors)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Quiz to {{ event.title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
          <p class="text-sm text-muted-foreground">
            Enter a descriptive title for the quiz (e.g. "Pre-Event Knowledge Check")
          </p>
        </div>

        <div class="space-y-2">
          <Label>Description</Label>
          <Textarea 
            v-model="form.description" 
            :error="form.errors.description"
            placeholder="Enter a brief description of this quiz..."
            rows="3"
          />
          <p class="text-sm text-muted-foreground">
            Provide a brief description of what this quiz covers (optional)
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            @click="$emit('update:open', false)"
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            :disabled="form.processing"
            class="bg-primary hover:bg-primary/90"
          >
            {{ form.processing ? 'Creating...' : 'Create Quiz' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>