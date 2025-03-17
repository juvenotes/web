<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import { ExamType, PaperType, ExamTypeLabels } from '#enums/exam_type'
import { StudyLevel, StudyLevelLabels } from '#enums/study_level'

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
  paperType: PaperType.SPOT, // Correct paper type for SPOT
  examType: ExamType.EOY,
  conceptId: props.concept.id,
  studyLevel: StudyLevel.LEVEL_1,
})

function handleSubmit() {
  form.post('/manage/spot', {
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
        <DialogTitle>Add SPOT Paper to {{ concept.title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :class="{ 'border-destructive': form.errors.title }" />
          <p v-if="form.errors.title" class="text-sm text-destructive">
            {{ form.errors.title }}
          </p>
        </div>

        <div class="space-y-2">
          <Label>Year</Label>
          <Input 
            v-model="form.year" 
            :class="{ 'border-destructive': form.errors.year }"
          />
          <p v-if="form.errors.year" class="text-sm text-destructive">
            {{ form.errors.year }}
          </p>
        </div>

        <div class="space-y-2">
          <Label>Exam Type</Label>
          <Select v-model="form.examType">
            <SelectTrigger :class="{ 'border-destructive': form.errors.examType }">
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(ExamType)" :key="type" :value="type">
                {{ ExamTypeLabels[type] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.examType" class="text-sm text-destructive">
            {{ form.errors.examType }}
          </p>
        </div>

        <div class="space-y-2">
          <Label>Study Level</Label>
          <Select v-model="form.studyLevel">
            <SelectTrigger :class="{ 'border-destructive': form.errors.studyLevel }">
              <SelectValue placeholder="Select study level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(StudyLevel)" :key="type" :value="type">
                {{ StudyLevelLabels[type] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.studyLevel" class="text-sm text-destructive">
            {{ form.errors.studyLevel }}
          </p>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Creating...' : 'Create SPOT Paper' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>