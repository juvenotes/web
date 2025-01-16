<script setup lang="ts">
import AuthLayout from '~/layouts/AuthLayout.vue'
import { ref, computed } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import { Loader } from 'lucide-vue-next'
import UserDto from '#dtos/user'
import InstitutionDto from '#dtos/institution'
import CourseDto from '#dtos/course'
import EducationLevelDto from '#dtos/education_level'

defineOptions({ layout: AuthLayout })

// Props with proper typing
interface Props {
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null
  educationLevels: EducationLevelDto[]
  availableCourses: CourseDto[]
  availableInstitutions: InstitutionDto[]
  graduationYears: number[]
}

const props = defineProps<Props>()

// Step management
const currentStep = ref(1)
const totalSteps = 4

const stepTitles: Record<number, string> = {
  1: 'Select Your Education Level',
  2: 'Choose Your Course',
  3: 'Select Your Institution',
  4: 'Expected Graduation Year',
}

interface FormData {
  education_level_id: string
  course_id: string
  institution_id: string
  graduation_year: string
}

const form = useForm<FormData>({
  education_level_id: '',
  course_id: '',
  institution_id: '',
  graduation_year: new Date().getFullYear().toString(),
})

const filteredCourses = computed(() => {
  if (!form.education_level_id) return []

  return props.availableCourses.filter((course) =>
    course.educationLevels.some((level) => level.id === parseInt(form.education_level_id!))
  )
})

const filteredInstitutions = computed(() => {
  if (!form.course_id) return []
  return props.availableInstitutions.filter((institution) =>
    institution.courses.some((course) => course.id === parseInt(form.course_id!))
  )
})

// Available graduation years (from 2020 to current year + 10)
const availableGraduationYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => currentYear + i)
})

// Validation states
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!form.education_level_id
    case 2:
      return !!form.course_id
    case 3:
      return !!form.institution_id
    case 4:
      return !!form.graduation_year
    default:
      return false
  }
})

// Step handlers
const handleNextStep = () => {
  if (!isStepValid.value) return
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const handlePreviousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = () => {
  if (!isStepValid.value) return

  if (currentStep.value === totalSteps) {
    form.post('/auth/personalize', {
      data: {
        education_level_id: form.education_level_id ? parseInt(form.education_level_id) : null,
        course_id: form.course_id ? parseInt(form.course_id) : null,
        institution_id: form.institution_id ? parseInt(form.institution_id) : null,
        graduation_year: parseInt(form.graduation_year),
      },
    })
  } else {
    handleNextStep()
  }
}

// Reset dependent fields when parent selection changes
const handleLevelChange = () => {
  form.course_id = ''
  form.institution_id = ''
}

const handleCourseChange = () => {
  form.institution_id = ''
}
</script>

<template>
  <AppHead title="Personalize" description="Personalize your experience" />
  <div class="max-w-md mx-auto p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold">{{ stepTitles[currentStep] }}</h1>
      <p class="text-sm text-muted-foreground mt-2">Step {{ currentStep }} of {{ totalSteps }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Education Level Step -->
      <div v-show="currentStep === 1" class="space-y-2">
        <Label for="education_level">Education Level</Label>
        <Select v-model="form.education_level_id" @update:modelValue="handleLevelChange">
          <SelectTrigger id="education_level">
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="level in educationLevels"
              :key="level.id"
              :value="level.id.toString()"
            >
              {{ level.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="form.errors.education_level_id" class="text-sm text-red-500">
          {{ form.errors.education_level_id }}
        </p>
      </div>

      <!-- Course Step -->
      <div v-show="currentStep === 2" class="space-y-2">
        <Label for="course">Course</Label>
        <Select v-model="form.course_id" @update:modelValue="handleCourseChange">
          <SelectTrigger id="course">
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="course in filteredCourses"
              :key="course.id"
              :value="course.id.toString()"
            >
              {{ course.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="form.errors.course_id" class="text-sm text-red-500">
          {{ form.errors.course_id }}
        </p>
      </div>

      <!-- Institution Step -->
      <div v-show="currentStep === 3" class="space-y-2">
        <Label for="institution">Institution</Label>
        <Select v-model="form.institution_id">
          <SelectTrigger id="institution">
            <SelectValue placeholder="Select Institution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="institution in filteredInstitutions"
              :key="institution.id"
              :value="institution.id.toString()"
            >
              {{ institution.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="form.errors.institution_id" class="text-sm text-red-500">
          {{ form.errors.institution_id }}
        </p>
      </div>

      <!-- Graduation Year Step -->
      <div v-show="currentStep === 4" class="space-y-2">
        <Label for="graduation_year">Expected Graduation Year</Label>
        <Select v-model="form.graduation_year">
          <SelectTrigger id="graduation_year">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="year in availableGraduationYears"
              :key="year"
              :value="year.toString()"
            >
              {{ year }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex justify-between">
        <Button type="button" variant="outline" @click="handlePreviousStep" v-if="currentStep > 1">
          Back
        </Button>

        <Button type="submit" class="ml-auto" :disabled="!isStepValid || form.processing">
          <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
          {{ currentStep === totalSteps ? 'Complete Setup' : 'Continue' }}
        </Button>
      </div>
    </form>
  </div>
</template>
