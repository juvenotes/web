<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import { TrainingLevel, TrainingLevelLabels } from '#enums/training_level'
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
  trainingLevel: props.concept.trainingLevel,
})

const handleSubmit = () => {
  form.put(`/manage/concepts/${props.concept.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Concept</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="form.isTerminal"
            id="edit-terminal"
            class="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          <Label for="edit-terminal">Is Terminal Concept</Label>
        </div>

        <div v-if="concept.isRoot" class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="form.hasOsce"
            id="has-osce"
            class="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
          <Label for="has-osce">Has OSCE</Label>
        </div>

        <div v-if="concept.isRoot" class="space-y-2">
          <Label for="training-level">Training Level</Label>
          <select
            id="training-level"
            v-model="form.trainingLevel"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            :class="{ 'border-red-500': form.errors.trainingLevel }"
          >
            <option value="">Select training level</option>
            <option v-for="level in Object.values(TrainingLevel)" :key="level" :value="level">
              {{ TrainingLevelLabels[level] }}
            </option>
          </select>
          <span v-if="form.errors.trainingLevel" class="text-sm text-red-500">
            {{ form.errors.trainingLevel }}
          </span>
        </div>

        <Button type="submit" :disabled="form.processing" class="w-full">
          {{ form.processing ? 'Saving...' : 'Save Changes' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>