<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { router, useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import { ExamType, PaperType, PaperTypeLabels, ExamTypeLabels } from '#enums/exam_type'

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
  paperType: PaperType.MCQ,
  examType: ExamType.EOY,
  conceptId: props.concept.id,
})

function handleSubmit() {
  form.post('/manage/papers', {
    preserveScroll: true,
    onSuccess: (response) => {
      emit('update:open', false)
      form.reset()
      // Force a fresh visit to load new data
      router.visit(response.url, {
        preserveState: false,
        preserveScroll: true
      })
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Paper to {{ concept.title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
        </div>

        <div class="space-y-2">
          <Label>Year</Label>
          <Input v-model="form.year" :error="form.errors.year" />
        </div>

        <div class="space-y-2">
          <Label>Paper Type</Label>
          <Select v-model="form.paperType">
            <SelectTrigger :class="{ 'border-red-500': form.errors.paperType }">
              <SelectValue placeholder="Select paper type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(PaperType)" :key="type" :value="type">
                {{ PaperTypeLabels[type] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <span v-if="form.errors.paperType" class="text-sm text-red-500">
            {{ form.errors.paperType }}
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
          {{ form.processing ? 'Creating...' : 'Create Paper' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
