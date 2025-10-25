<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useForm } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'

const props = defineProps<{
  open: boolean
  event: EventDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  description: '',
  quizMode: 'timed_lockdown',
  durationMinutes: 120,
  lockdownMode: false,
  timeLimit: false,
  startTime: '',
  endTime: '',
})

function handleSubmit() {
  const isTimed = form.quizMode === 'timed_lockdown'
  const data = {
    ...form.data(),
    hasTimer: isTimed,
    autoSubmit: isTimed,
    durationMinutes: isTimed ? form.durationMinutes : null,
    lockdownMode: isTimed ? form.lockdownMode : false,
    startTime: form.timeLimit ? form.startTime : null,
    endTime: form.timeLimit ? form.endTime : null,
  }

  form.post(`/manage/events/${props.event.slug}/quiz`, {
    ...data,
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
    onError: (errors) => {
      console.error('Form errors:', errors)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Quiz to {{ event.title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
          <p class="text-sm text-muted-foreground">
            Enter a descriptive title for the quiz (e.g. "Pre-Event Knowledge Check")
          </p>
        </div>

        <div class="space-y-2">
          <Label>Description</Label>
          <Textarea
            v-model="form.description"
            :error="form.errors.description"
            placeholder="Enter a brief description of this quiz..."
            rows="3"
          />
          <p class="text-sm text-muted-foreground">
            Provide a brief description of what this quiz covers (optional)
          </p>
        </div>

        <div class="space-y-2">
          <Label>Quiz Mode</Label>
          <Select v-model="form.quizMode">
            <SelectTrigger>
              <SelectValue placeholder="Select quiz mode..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard"> Standard (Immediate Feedback) </SelectItem>
              <SelectItem value="timed_lockdown"> Timed Lockdown (Exam) </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-sm text-muted-foreground">
            Choose between a standard quiz or a timed, exam-style quiz.
          </p>
        </div>

        <!-- Timed Lockdown Settings -->
        <div v-if="form.quizMode === 'timed_lockdown'" class="space-y-4 pt-4 border-t">
          <h4 class="font-medium text-foreground">Timed Quiz Settings</h4>
          <div class="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              v-model="form.durationMinutes"
              type="number"
              :error="form.errors.durationMinutes"
            />
            <p class="text-sm text-muted-foreground">Set the quiz duration in minutes.</p>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="lockdown-mode" v-model="form.lockdownMode" />
            <Label for="lockdown-mode">Enable Lockdown Mode</Label>
          </div>
          <p class="text-sm text-muted-foreground">
            Detects tab switching and alerts students.
          </p>

          <div class="flex items-center gap-2">
            <Checkbox id="time-limit" v-model="form.timeLimit" />
            <Label for="time-limit">Enable Time Limit</Label>
          </div>
          <p class="text-sm text-muted-foreground">
            Set a window of time during which the quiz can be attempted.
          </p>

          <div v-if="form.timeLimit" class="space-y-2">
            <Label>Start Time</Label>
            <Input v-model="form.startTime" type="datetime-local" />
            <Label>End Time</Label>
            <Input v-model="form.endTime" type="datetime-local" />
          </div>
        </div>

        <div class="flex flex-wrap justify-start sm:justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" @click="$emit('update:open', false)" variant="outline">
            Cancel
          </Button>
          <Button type="submit" :disabled="form.processing" class="bg-primary hover:bg-primary/90">
            {{ form.processing ? 'Creating...' : 'Create Quiz' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
