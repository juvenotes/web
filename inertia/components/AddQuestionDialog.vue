<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { QuestionType } from '#enums/question_types'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import { Plus, Trash } from 'lucide-vue-next'
import { watch } from 'vue'
import { generateSlug } from '#utils/slug_generator'

interface Choice {
  choiceText: string
  isCorrect: boolean
  explanation: string
}

interface Part {
  partText: string
  expectedAnswer: string
  marks: number
}

interface FormData {
  questionText: string
  type: QuestionType
  choices: Choice[]
  parts: Part[]
  slug: string
}

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm<FormData>({
  questionText: '',
  type: QuestionType.MCQ,
  choices: [{ choiceText: '', isCorrect: true, explanation: '' }],
  parts: [],
  slug: generateSlug(),
})

watch(
  () => form.type,
  (newType) => {
    if (newType === QuestionType.MCQ) {
      form.parts = []
      if (form.choices.length === 0) {
        form.choices = [{ choiceText: '', isCorrect: true, explanation: '' }]
      }
    } else {
      form.choices = []
      if (form.parts.length === 0) {
        form.parts = [{ partText: '', expectedAnswer: '', marks: 1 }]
      }
    }
  }
)

const getError = (path: string) => {
  return form.errors[path as keyof typeof form.errors]
}

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
    isCorrect: i === index,
  }))
}

const addPart = () => {
  form.parts.push({ partText: '', expectedAnswer: '', marks: 1 })
}

const removePart = (index: number) => {
  if (form.parts.length > 1) {
    form.parts.splice(index, 1)
  }
}

const handleSubmit = () => {
  form.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/questions`, {
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Add Question</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="max-h-[60vh] overflow-y-auto pr-4">
          <!-- Question Text -->
          <div class="space-y-2">
            <Label>Question Text</Label>
            <Input
              v-model="form.questionText"
              :class="{ 'border-destructive': getError('questionText') }"
            />
            <p v-if="getError('questionText')" class="text-sm text-destructive">
              {{ getError('questionText') }}
            </p>
          </div>

          <!-- Question Type -->
          <div class="space-y-2 mt-4">
            <Label>Question Type</Label>
            <Select v-model="form.type">
              <SelectTrigger :class="{ 'border-destructive': getError('type') }">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="QuestionType.MCQ">Multiple Choice</SelectItem>
                <SelectItem :value="QuestionType.SAQ">Structured Answer</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="getError('type')" class="text-sm text-destructive">
              {{ getError('type') }}
            </p>
          </div>

          <!-- MCQ Section -->
          <div v-if="form.type === QuestionType.MCQ" class="space-y-4 mt-4">
            <div
              v-for="(choice, index) in form.choices"
              :key="index"
              class="p-4 border rounded-lg space-y-3"
              :class="{
                'border-destructive':
                  getError(`choices.${index}.choiceText`) ||
                  getError(`choices.${index}.explanation`),
              }"
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
                  <Trash class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="choice.choiceText"
                  :placeholder="`Choice ${String.fromCharCode(65 + index)}`"
                  :class="{ 'border-destructive': getError(`choices.${index}.choiceText`) }"
                />
                <p v-if="getError(`choices.${index}.choiceText`)" class="text-sm text-destructive">
                  {{ getError(`choices.${index}.choiceText`) }}
                </p>
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
                  :class="{ 'border-destructive': getError(`choices.${index}.explanation`) }"
                />
                <p v-if="getError(`choices.${index}.explanation`)" class="text-sm text-destructive">
                  {{ getError(`choices.${index}.explanation`) }}
                </p>
              </div>
            </div>

            <p v-if="getError('choices')" class="text-sm text-destructive">
              {{ getError('choices') }}
            </p>

            <Button
              v-if="form.choices.length < 5"
              type="button"
              variant="outline"
              @click="addChoice"
              class="w-full"
            >
              <Plus class="h-4 w-4 mr-2" />
              Add Choice ({{ form.choices.length }}/5)
            </Button>
          </div>

          <!-- SAQ Section -->
          <div v-if="form.type === QuestionType.SAQ" class="space-y-4 mt-4">
            <div
              v-for="(part, index) in form.parts"
              :key="index"
              class="p-4 border rounded-lg space-y-3"
              :class="{
                'border-destructive':
                  getError(`parts.${index}.partText`) ||
                  getError(`parts.${index}.expectedAnswer`) ||
                  getError(`parts.${index}.marks`),
              }"
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
                  <Trash class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="part.partText"
                  placeholder="Question part"
                  :class="{ 'border-destructive': getError(`parts.${index}.partText`) }"
                />
                <p v-if="getError(`parts.${index}.partText`)" class="text-sm text-destructive">
                  {{ getError(`parts.${index}.partText`) }}
                </p>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="part.expectedAnswer"
                  placeholder="Expected answer"
                  :class="{ 'border-destructive': getError(`parts.${index}.expectedAnswer`) }"
                />
                <p
                  v-if="getError(`parts.${index}.expectedAnswer`)"
                  class="text-sm text-destructive"
                >
                  {{ getError(`parts.${index}.expectedAnswer`) }}
                </p>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="part.marks"
                  type="number"
                  min="1"
                  placeholder="Marks"
                  :class="{ 'border-destructive': getError(`parts.${index}.marks`) }"
                />
                <p v-if="getError(`parts.${index}.marks`)" class="text-sm text-destructive">
                  {{ getError(`parts.${index}.marks`) }}
                </p>
              </div>
            </div>

            <p v-if="getError('parts')" class="text-sm text-destructive">
              {{ getError('parts') }}
            </p>

            <Button type="button" variant="outline" @click="addPart" class="w-full">
              <Plus class="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </div>
        </div>

        <!-- Submit Button -->
        <Button type="submit" :disabled="form.processing" class="w-full">
          {{ form.processing ? 'Adding...' : 'Add Question' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
