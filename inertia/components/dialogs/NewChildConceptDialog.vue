<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useForm } from '@inertiajs/vue3'

const props = defineProps<{
  open: boolean
  parentId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  parentId: props.parentId,
  isTerminal: false,
})

const handleSubmit = () => {
  form.post('/manage/concepts', {
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create child concept')
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] max-w-[800px] sm:w-[90vw]">
      <DialogHeader>
        <DialogTitle>Add Child Concept</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="child-title">Title</Label>
          <Input
            id="child-title"
            v-model="form.title"
            :class="{ 'border-destructive': form.errors.title }"
          />
          <p v-if="form.errors.title" class="text-sm text-destructive">
            {{ form.errors.title }}
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="form.isTerminal"
            id="child-terminal"
            class="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          <Label for="child-terminal">Is Terminal Concept</Label>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Creating...' : 'Create Concept' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
