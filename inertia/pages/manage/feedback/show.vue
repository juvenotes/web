<script setup lang="ts">
import { ref } from 'vue'
import type QuestionDto from '#dtos/question'
import type QuestionFeedbackDto from '#dtos/question_feedback'
import AdminLayout from '~/layouts/AdminLayout.vue'
import axios from 'axios'
import { toast } from 'vue-sonner'

const props = defineProps<{
  question: QuestionDto
  feedbackItems: QuestionFeedbackDto[]
}>()

defineOptions({ layout: AdminLayout })

const editing = ref(false)
const editedQuestion = ref({ ...props.question })

function startEdit() {
  editing.value = true
  editedQuestion.value = { ...props.question }
}
function cancelEdit() {
  editing.value = false
}
async function saveEdit() {
  await axios.patch(`/api/manage/questions/${props.question.id}`, {
    questionText: editedQuestion.value.questionText,
  })
  toast.success('Question stem updated!')
  editing.value = false
}

async function saveMcqChoice(choice: any) {
  await axios.patch(`/api/manage/mcq-choices/${choice.id}`, {
    choiceText: choice.choiceText,
    explanation: choice.explanation,
    isCorrect: choice.isCorrect,
  })
  toast.success('MCQ choice updated!')
}
async function saveSaqPart(part: any) {
  await axios.patch(`/api/manage/saq-parts/${part.id}`, {
    partText: part.partText,
  })
  toast.success('SAQ part updated!')
}
async function saveOsceStation(station: any) {
  await axios.patch(`/api/manage/osce-stations/${station.id}`, {
    partText: station.partText,
    expectedAnswer: station.expectedAnswer,
    marks: station.marks,
  })
  toast.success('OSCE station updated!')
}
async function saveSpotStation(spot: any) {
  await axios.patch(`/api/manage/spot-stations/${spot.id}`, {
    partText: spot.partText,
    expectedAnswer: spot.expectedAnswer,
    marks: spot.marks,
  })
  toast.success('Spot station updated!')
}

async function markFeedbackResolved() {
  const feedback = props.feedbackItems[0]
  if (!feedback || feedback.isResolved) return
  await axios.post(`/manage/feedback/${feedback.id}/resolve`)
  toast.success('Feedback marked as resolved!')
  feedback.isResolved = true
}
</script>

<template>
  <div>
    <NotificationListener :user-id="props.question.userId" />
    <AppHead :title="props.question.questionText" :description="props.question.questionText" />
    <div class="max-w-3xl mx-auto py-6 px-2 sm:px-4">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Question Details</h1>
      <div class="bg-white dark:bg-card rounded-2xl shadow-lg p-4 sm:p-8 mb-8 border border-gray-100 dark:border-border">
        <div class="mb-6">
          <div
            class="mb-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-foreground max-w-full"
            style="line-height: 1.4"
          >
            <span title="{{ props.question.questionText }}">{{ props.question.questionText }}</span>
          </div>
          <div v-if="props.question.questionImagePath" class="mb-4 flex justify-center">
            <img
              :src="props.question.questionImagePath"
              alt="Question Image"
              class="max-w-full sm:max-w-xs rounded-lg border border-gray-200 dark:border-border shadow"
            />
          </div>
        </div>
        <div v-if="props.question.isSaq && props.question.parts.length">
          <h3 class="font-semibold mb-3 text-lg text-primary">SAQ Parts</h3>
          <ul class="space-y-3">
            <li
              v-for="part in props.question.parts"
              :key="part.id"
              class="bg-slate-50 dark:bg-card rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-slate-100 dark:border-border"
            >
              <input
                v-model="part.partText"
                @blur="saveSaqPart(part)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
              />
              <Button
                size="sm"
                variant="outline"
                class="w-full sm:w-auto"
                @click="saveSaqPart(part)"
                >Save</Button
              >
            </li>
          </ul>
        </div>
        <div v-else-if="props.question.isMcq && props.question.choices.length">
          <h3 class="font-semibold mb-3 text-lg text-primary">MCQ Choices</h3>
          <ul class="space-y-3">
            <li
              v-for="choice in props.question.choices"
              :key="choice.id"
              class="bg-slate-50 dark:bg-card rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-slate-100 dark:border-border"
            >
              <input
                v-model="choice.choiceText"
                @blur="saveMcqChoice(choice)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Choice text"
              />
              <input
                v-model="choice.explanation"
                @blur="saveMcqChoice(choice)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Explanation (optional)"
              />
              <div class="flex items-center gap-1">
                <input
                  type="checkbox"
                  v-model="choice.isCorrect"
                  @change="saveMcqChoice(choice)"
                  class="ml-2 accent-primary"
                />
                <span class="text-xs ml-1">Correct</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                class="w-full sm:w-auto"
                @click="saveMcqChoice(choice)"
                >Save</Button
              >
            </li>
          </ul>
        </div>
        <div v-else-if="props.question.isOsce && props.question.stations.length">
          <h3 class="font-semibold mb-3 text-lg text-primary">OSCE Stations</h3>
          <ul class="space-y-3">
            <li
              v-for="station in props.question.stations"
              :key="station.id"
              class="bg-slate-50 dark:bg-card rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-slate-100 dark:border-border"
            >
              <input
                v-model="station.partText"
                @blur="saveOsceStation(station)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Station description"
              />
              <input
                v-model="station.expectedAnswer"
                @blur="saveOsceStation(station)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Expected Answer"
              />
              <input
                v-model.number="station.marks"
                @blur="saveOsceStation(station)"
                class="border rounded px-2 py-1 w-20 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Marks"
                type="number"
                min="0"
              />
              <Button
                size="sm"
                variant="outline"
                class="w-full sm:w-auto"
                @click="saveOsceStation(station)"
                >Save</Button
              >
            </li>
          </ul>
        </div>
        <div v-else-if="props.question.isSpot && props.question.spotStations.length">
          <h3 class="font-semibold mb-3 text-lg text-primary">Spot Stations</h3>
          <ul class="space-y-3">
            <li
              v-for="spot in props.question.spotStations"
              :key="spot.id"
              class="bg-slate-50 dark:bg-card rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-slate-100 dark:border-border"
            >
              <input
                v-model="spot.partText"
                @blur="saveSpotStation(spot)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Station description"
              />
              <input
                v-model="spot.expectedAnswer"
                @blur="saveSpotStation(spot)"
                class="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Expected Answer"
              />
              <input
                v-model.number="spot.marks"
                @blur="saveSpotStation(spot)"
                class="border rounded px-2 py-1 w-20 text-sm focus:ring-2 focus:ring-primary/30"
                placeholder="Marks"
                type="number"
                min="0"
              />
              <Button
                size="sm"
                variant="outline"
                class="w-full sm:w-auto"
                @click="saveSpotStation(spot)"
                >Save</Button
              >
            </li>
          </ul>
        </div>
        <!-- Edit Question Stem Button at the end of the question details -->
        <div class="flex flex-col sm:flex-row justify-end mt-8 gap-2">
          <button
            v-if="!editing"
            class="btn btn-primary px-6 py-2 text-base w-full sm:w-auto flex items-center gap-2 shadow hover:bg-primary/90 transition"
            @click="startEdit"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6"
              />
            </svg>
            Edit Question Stem
          </button>
        </div>
        <div v-if="editing" class="mt-6">
          <textarea
            v-model="editedQuestion.questionText"
            class="w-full border dark:border-border rounded p-3 mb-4 text-lg focus:ring-2 focus:ring-primary/30 dark:bg-card dark:text-foreground"
            rows="4"
          />
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              class="btn btn-success px-6 py-2 text-base w-full sm:w-auto flex items-center gap-2 shadow hover:bg-green-600 transition"
              @click="saveEdit"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
            <button
              class="btn btn-secondary px-6 py-2 text-base w-full sm:w-auto flex items-center gap-2 shadow hover:bg-gray-300 transition"
              @click="cancelEdit"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      </div>
      <!-- Mark as Resolved button after editing -->
      <div class="flex flex-col sm:flex-row justify-end mt-6 gap-2">
        <button
          v-if="props.feedbackItems.some((fb) => !fb.isResolved)"
          class="btn btn-success px-6 py-2 text-base w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 dark:text-white rounded"
          @click="markFeedbackResolved"
        >
          Mark Feedback as Resolved
        </button>
      </div>
      <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-primary mt-10">Feedback</h2>
      <div v-if="props.feedbackItems.length === 0" class="text-gray-500 dark:text-muted-foreground text-center">
        No feedback found for this question.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="item in props.feedbackItems"
          :key="item.id"
          class="bg-gray-50 dark:bg-card rounded-lg p-4 border border-gray-200 dark:border-border shadow-sm flex flex-col sm:flex-row sm:items-center gap-2"
        >
          <div class="font-medium text-gray-900 dark:text-foreground mb-1">{{ item.user?.fullName || 'User' }}</div>
          <div class="text-gray-700 dark:text-muted-foreground mb-1 break-words">{{ item.feedbackText }}</div>
          <div class="text-xs text-gray-400 dark:text-muted-foreground mb-1">
            Target: {{ item.feedbackTarget }} | Source: {{ item.feedbackSource }}
          </div>
          <div class="text-xs text-gray-400 dark:text-muted-foreground">
            Resolved:
            <span :class="item.isResolved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{
              item.isResolved ? 'Yes' : 'No'
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .max-w-3xl {
    max-width: 100vw;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}
</style>
