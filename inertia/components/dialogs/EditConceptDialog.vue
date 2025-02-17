<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import { useForm } from '@inertiajs/vue3'

const props = defineProps<{
  open: boolean
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: props.concept.title,
  isTerminal: props.concept.isTerminal,
  hasOsce: props.concept?.hasOsce ?? false,
})

const handleSubmit = () => {
  form.put(`/manage/concepts/${props.concept.slug}`, {
    onSuccess: () => {
      emit('update:open', false)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] max-w-[800px] sm:w-[90vw]">
      <DialogHeader>
        <DialogTitle>Edit Concept</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" />
          <p v-if="form.errors.title" class="text-sm text-destructive">
            {{ form.errors.title }}
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="form.isTerminal"
            id="edit-terminal"
            class="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          <Label for="edit-terminal">Is a Terminal Concept</Label>
        </div>
        <p v-if="form.isTerminal" class="text-sm text-muted-foreground">
          A terminal concept is a topic that has notes in it.
        </p>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="form.hasOsce"
            id="has-osce"
            class="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          <Label for="has-osce">Has OSCE</Label>
        </div>

        <p v-if="form.hasOsce" class="text-sm text-muted-foreground">
          This concept will appear in the OSCE section and can have OSCE papers attached.
        </p>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Saving...' : 'Save Changes' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
