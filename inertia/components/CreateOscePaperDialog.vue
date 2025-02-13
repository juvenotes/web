<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import { ExamType, PaperType, ExamTypeLabels } from '#enums/exam_type'

const props = defineProps<{
  open: boolean
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  year: new Date().getFullYear().toString(),
  paperType: PaperType.OSCE, // Default and only option
  examType: ExamType.EOY,
  conceptId: props.concept.id,
  questionImage: null as File | null,
  parts: [
    {
      partText: '',
      expectedAnswer: '',
      marks: 1,
      image: null as File | null,
    },
  ],
})

function handleSubmit() {
  form.post('/manage/osce', {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add OSCE Paper to {{ concept.title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
          <span v-if="form.errors.title" class="text-sm text-red-500">
            {{ form.errors.title }}
          </span>
        </div>

        <div class="space-y-2">
          <Label>Year</Label>
          <Input v-model="form.year" :error="form.errors.year" />
          <span v-if="form.errors.year" class="text-sm text-red-500">
            {{ form.errors.year }}
          </span>
        </div>

        <div class="space-y-2">
          <Label>Exam Type</Label>
          <Select v-model="form.examType">
            <SelectTrigger :class="{ 'border-red-500': form.errors.examType }">
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(ExamType)" :key="type" :value="type">
                {{ ExamTypeLabels[type] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <span v-if="form.errors.examType" class="text-sm text-red-500">
            {{ form.errors.examType }}
          </span>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Creating...' : 'Create OSCE Paper' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
