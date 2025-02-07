<script setup lang="ts">
import { Trash2, Plus } from 'lucide-vue-next'
import { useForm } from '@inertiajs/vue3'
import { QuestionType } from '#enums/question_types'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  questionText: '',
  type: QuestionType.SAQ as const,
  parts: [{ partText: '', expectedAnswer: '', marks: 1 }],
})

const addPart = () => {
  if (form.parts.length < 5) {
    form.parts.push({ partText: '', expectedAnswer: '', marks: 1 })
  }
}

const removePart = (index: number) => {
  if (form.parts.length > 1) {
    form.parts.splice(index, 1)
  }
}

const handleSubmit = () => {
  form.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/saq`, {
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
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader
        class="bg-background/95 backdrop-blur-sm z-20 p-4 sm:pb-4 border-b max-w-screen-lg mx-auto"
      >
        <DialogTitle class="text-lg sm:text-xl">Add SAQ to {{ paper.title }}</DialogTitle>
      </DialogHeader>

      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <!-- Question Text -->
          <div class="space-y-2 sm:space-y-3">
            <Label class="text-sm sm:text-base">Question Text</Label>
            <Input
              v-model="form.questionText"
              class="min-h-[44px] sm:min-h-[48px]"
              :class="{ 'border-destructive': form.errors.questionText }"
            />
          </div>

          <!-- Parts Section -->
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <Label class="text-sm sm:text-base">Parts ({{ form.parts.length }}/5)</Label>
              <Button type="button" variant="outline" size="sm" class="h-8 sm:h-9" @click="addPart">
                <Plus class="h-4 w-4 mr-2" />Add Part
              </Button>
            </div>

            <!-- Part Cards -->
            <div
              v-for="(part, index) in form.parts"
              :key="index"
              class="p-3 sm:p-4 border rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between">
                <Label>Part {{ index + 1 }}</Label>
                <Button
                  v-if="form.parts.length > 1"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removePart(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input v-model="part.partText" placeholder="Part question" />
              </div>

              <div class="space-y-2">
                <Textarea
                  v-model="part.expectedAnswer"
                  :placeholder="'Expected answer can include lists:\n- Point 1\n- Point 2\n- Point 3'"
                  rows="4"
                  class="resize-y min-h-[100px]"
                />
              </div>

              <div class="space-y-2">
                <Input v-model="part.marks" type="number" placeholder="Marks" min="1" />
              </div>
            </div>
          </div>

          <Button type="submit" :disabled="form.processing" class="w-full h-10 sm:h-11">
            {{ form.processing ? 'Adding...' : 'Add SAQ' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
