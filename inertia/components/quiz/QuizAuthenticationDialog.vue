<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '~/components/ui/dialog'
import { AlertCircle, User, School, IdCard, Clock } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  eventTitle: string
  quizTitle: string
  durationMinutes?: number | null
  lockdownMode?: boolean
}

interface Emits {
  (e: 'start-quiz', data: { fullName: string; studentId: string; school: string }): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fullName = ref('')
const studentId = ref('')
const school = ref('')
const isSubmitting = ref(false)

const isValid = computed(() => {
  return fullName.value.trim() && studentId.value.trim() && school.value.trim()
})

const durationText = computed(() => {
  if (!props.durationMinutes) return 'No time limit'
  if (props.durationMinutes === 120) return '2 hours'
  if (props.durationMinutes >= 60) return `${Math.floor(props.durationMinutes / 60)} hours ${props.durationMinutes % 60} minutes`
  return `${props.durationMinutes} minutes`
})

function handleSubmit() {
  if (!isValid.value) return
  
  isSubmitting.value = true
  emit('start-quiz', {
    fullName: fullName.value.trim(),
    studentId: studentId.value.trim(),
    school: school.value.trim()
  })
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <User class="h-5 w-5 text-[#55A9C4]" />
          Quiz Authentication
        </DialogTitle>
        <DialogDescription>
          Please provide your information before starting the {{ quizTitle }} quiz for {{ eventTitle }}.
        </DialogDescription>
      </DialogHeader>
      
      <!-- Quiz Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 mb-2">
          <Clock class="h-4 w-4 text-blue-600" />
          <span class="text-sm font-medium text-blue-800">Duration: {{ durationText }}</span>
        </div>
        
        <div v-if="lockdownMode" class="flex items-start gap-2">
          <AlertCircle class="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-amber-800">
            <div class="font-medium mb-1">Lockdown Mode Active</div>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>Tab switching will be monitored</li>
              <li>Excessive suspicious activity may result in auto-submission</li>
              <li>Keep this window focused during the quiz</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="fullName" class="flex items-center gap-2">
            <User class="h-4 w-4" />
            Full Name <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="fullName"
            v-model="fullName"
            placeholder="Enter your full name as registered"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="studentId" class="flex items-center gap-2">
            <IdCard class="h-4 w-4" />
            Student ID <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="studentId"
            v-model="studentId"
            placeholder="Enter your student ID number"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="school" class="flex items-center gap-2">
            <School class="h-4 w-4" />
            School/Institution <span class="text-red-500">*</span>
          </Label>
          <Input 
            id="school"
            v-model="school"
            placeholder="Enter your school or institution name"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <DialogFooter>
        <Button 
          variant="outline" 
          @click="handleClose"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button 
          @click="handleSubmit"
          :disabled="!isValid || isSubmitting"
          class="bg-[#55A9C4] hover:bg-[#4795af] text-white"
        >
          <span v-if="isSubmitting">Starting Quiz...</span>
          <span v-else>Start Quiz</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>