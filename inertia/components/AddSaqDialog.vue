<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
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
  parts: [{ partText: '', expectedAnswer: '', marks: 1 }]
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
    }
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader class="sticky top-0 bg-background z-10 pb-4 border-b">
        <DialogTitle>Add SAQ to {{ paper.title }}</DialogTitle>
      </DialogHeader>

      <div class="py-4 px-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <Label>Question Text</Label>
            <Input 
              v-model="form.questionText" 
              :class="{ 'border-destructive': form.errors.questionText }"
            />
            <p v-if="form.errors.questionText" class="text-sm text-destructive">
              {{ form.errors.questionText }}
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <Label>Parts ({{ form.parts.length }}/5)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addPart"
                :disabled="form.parts.length >= 5"
              >
                <Plus class="h-4 w-4 mr-2" />Add Part
              </Button>
            </div>

            <div
              v-for="(part, index) in form.parts"
              :key="index"
              class="p-4 border rounded-lg space-y-3"
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
                <Input
                  v-model="part.partText"
                  placeholder="Part question"
                />
              </div>

              <div class="space-y-2">
                <Input
                  v-model="part.expectedAnswer"
                  placeholder="Expected answer"
                />
              </div>

              <div class="space-y-2">
                <Input
                  v-model="part.marks"
                  type="number"
                  placeholder="Marks"
                  min="1"
                />
              </div>
            </div>
          </div>

          <Button type="submit" :disabled="form.processing" class="w-full">
            {{ form.processing ? 'Adding...' : 'Add SAQ' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>