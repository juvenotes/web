<script setup lang="ts">
import { ref } from 'vue'
import type QuestionDto from '#dtos/question'
import type QuestionFeedbackDto from '#dtos/question_feedback'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Button } from '~/components/ui/button'
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
  <AppHead :title="props.question.questionText" :description="props.question.questionText" />
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold mb-8 text-center">Question Details</h1>
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
      <div class="mb-6">
        <div class="mb-4 text-2xl font-semibold text-gray-900">{{ props.question.questionText }}</div>
        <div v-if="props.question.questionImagePath" class="mb-4 flex justify-center">
          <img :src="props.question.questionImagePath" alt="Question Image" class="max-w-xs rounded-lg border border-gray-200 shadow" />
        </div>
      </div>
      <div v-if="props.question.isSaq && props.question.parts.length">
        <h3 class="font-semibold mb-3 text-lg text-primary">SAQ Parts</h3>
        <ul class="list-disc pl-8 space-y-1">
          <li v-for="part in props.question.parts" :key="part.id" class="text-gray-800 flex items-center gap-2">
            <input v-model="part.partText" @blur="saveSaqPart(part)" class="border rounded px-2 py-1 flex-1" />
            <Button size="sm" variant="outline" @click="saveSaqPart(part)">Save</Button>
          </li>
        </ul>
      </div>
      <div v-else-if="props.question.isMcq && props.question.choices.length">
        <h3 class="font-semibold mb-3 text-lg text-primary">MCQ Choices</h3>
        <ul class="list-disc pl-8 space-y-1">
          <li v-for="choice in props.question.choices" :key="choice.id" class="text-gray-800 flex items-center gap-2">
            <input v-model="choice.choiceText" @blur="saveMcqChoice(choice)" class="border rounded px-2 py-1 flex-1" />
            <input v-model="choice.explanation" @blur="saveMcqChoice(choice)" class="border rounded px-2 py-1 flex-1" placeholder="Explanation (optional)" />
            <input type="checkbox" v-model="choice.isCorrect" @change="saveMcqChoice(choice)" class="ml-2" />
            <span class="text-xs ml-1">Correct</span>
            <Button size="sm" variant="outline" @click="saveMcqChoice(choice)">Save</Button>
          </li>
        </ul>
      </div>
      <div v-else-if="props.question.isOsce && props.question.stations.length">
        <h3 class="font-semibold mb-3 text-lg text-primary">OSCE Stations</h3>
        <ul class="list-disc pl-8 space-y-1">
          <li v-for="station in props.question.stations" :key="station.id" class="text-gray-800 flex items-center gap-2">
            <input v-model="station.partText" @blur="saveOsceStation(station)" class="border rounded px-2 py-1 flex-1" />
            <input v-model="station.expectedAnswer" @blur="saveOsceStation(station)" class="border rounded px-2 py-1 flex-1" placeholder="Expected Answer" />
            <input v-model.number="station.marks" @blur="saveOsceStation(station)" class="border rounded px-2 py-1 w-20" placeholder="Marks" type="number" min="0" />
            <Button size="sm" variant="outline" @click="saveOsceStation(station)">Save</Button>
          </li>
        </ul>
      </div>
      <div v-else-if="props.question.isSpot && props.question.spotStations.length">
        <h3 class="font-semibold mb-3 text-lg text-primary">Spot Stations</h3>
        <ul class="list-disc pl-8 space-y-1">
          <li v-for="spot in props.question.spotStations" :key="spot.id" class="text-gray-800 flex items-center gap-2">
            <input v-model="spot.partText" @blur="saveSpotStation(spot)" class="border rounded px-2 py-1 flex-1" />
            <input v-model="spot.expectedAnswer" @blur="saveSpotStation(spot)" class="border rounded px-2 py-1 flex-1" placeholder="Expected Answer" />
            <input v-model.number="spot.marks" @blur="saveSpotStation(spot)" class="border rounded px-2 py-1 w-20" placeholder="Marks" type="number" min="0" />
            <Button size="sm" variant="outline" @click="saveSpotStation(spot)">Save</Button>
          </li>
        </ul>
      </div>
      <!-- Edit Question Stem Button at the end of the question details -->
      <div class="flex justify-end mt-8">
        <button v-if="!editing" class="btn btn-primary px-6 py-2 text-base" @click="startEdit">Edit Question Stem</button>
      </div>
      <div v-if="editing" class="mt-6">
        <textarea v-model="editedQuestion.questionText" class="w-full border rounded p-3 mb-4 text-lg" rows="4" />
        <div class="flex gap-3 justify-end">
          <button class="btn btn-success px-6 py-2 text-base" @click="saveEdit">Save</button>
          <button class="btn btn-secondary px-6 py-2 text-base" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
    <!-- Mark as Resolved button after editing -->
    <div class="flex justify-end mt-6">
      <button
        v-if="props.feedbackItems.some(fb => !fb.isResolved)"
        class="btn btn-success px-6 py-2 text-base"
        @click="markFeedbackResolved"
      >
        Mark Feedback as Resolved
      </button>
    </div>
    <h2 class="text-2xl font-semibold mb-4 text-primary">Feedback</h2>
    <div v-if="props.feedbackItems.length === 0" class="text-gray-500 text-center">No feedback found for this question.</div>
    <div v-else class="space-y-4">
      <div v-for="item in props.feedbackItems" :key="item.id" class="bg-gray-50 rounded-lg p-5 border border-gray-200 shadow-sm">
        <div class="font-medium text-gray-900 mb-1">{{ item.user?.fullName || 'User' }}</div>
        <div class="text-gray-700 mb-1">{{ item.feedbackText }}</div>
        <div class="text-xs text-gray-400 mb-1">Target: {{ item.feedbackTarget }} | Source: {{ item.feedbackSource }}</div>
        <div class="text-xs text-gray-400">Resolved: <span :class="item.isResolved ? 'text-green-600' : 'text-red-600'">{{ item.isResolved ? 'Yes' : 'No' }}</span></div>
      </div>
    </div>
  </div>
</template>
