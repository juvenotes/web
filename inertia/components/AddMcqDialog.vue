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
  type: QuestionType.MCQ as const,
  choices: [{ choiceText: '', isCorrect: true, explanation: '' }]
})

const addChoice = () => {
  if (form.choices.length < 5) {
    form.choices.push({ choiceText: '', isCorrect: false, explanation: '' })
  }
}

const removeChoice = (index: number) => {
  if (form.choices.length > 1) {
    const wasCorrect = form.choices[index].isCorrect
    form.choices.splice(index, 1)
    if (wasCorrect && form.choices.length > 0) {
      form.choices[0].isCorrect = true
    }
  }
}

const setCorrectChoice = (index: number) => {
  form.choices = form.choices.map((choice, i) => ({
    ...choice,
    isCorrect: i === index
  }))
}

const handleSubmit = () => {
  if (!form.choices.some(choice => choice.isCorrect)) {
    return
  }

  form.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/mcq`, {
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
        <DialogTitle>Add MCQ to {{ paper.title }}</DialogTitle>
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
              <Label>Choices ({{ form.choices.length }}/5)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addChoice"
                :disabled="form.choices.length >= 5"
              >
                <Plus class="h-4 w-4 mr-2" />Add Choice
              </Button>
            </div>

            <div
              v-for="(choice, index) in form.choices"
              :key="index"
              class="p-4 border rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between">
                <Label>Choice {{ String.fromCharCode(65 + index) }}</Label>
                <Button
                  v-if="form.choices.length > 1"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removeChoice(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="choice.choiceText"
                  :placeholder="`Choice ${String.fromCharCode(65 + index)}`"
                />
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-choice"
                  :checked="choice.isCorrect"
                  @change="setCorrectChoice(index)"
                />
                <Label>Correct Answer</Label>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="choice.explanation"
                  placeholder="Explanation (optional)"
                />
              </div>
            </div>
          </div>

          <Button type="submit" :disabled="form.processing" class="w-full">
            {{ form.processing ? 'Adding...' : 'Add MCQ' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>