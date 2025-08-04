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

  return props.availableCourses.filter(
    (course) =>
      course.educationLevel && course.educationLevel.id === parseInt(form.education_level_id)
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
  <div class="min-h-[75vh] flex items-center justify-center">
    <div class="w-full max-w-md mx-auto px-4 sm:px-6">
      <div
        class="bg-card rounded-lg border border-gray-100 shadow-sm p-5 sm:p-6 md:p-7 space-y-4 sm:space-y-5 md:space-y-6"
      >
        <div class="text-center space-y-1 sm:space-y-2">
          <h1 class="text-lg sm:text-xl md:text-2xl font-medium">{{ stepTitles[currentStep] }}</h1>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Step {{ currentStep }} of {{ totalSteps }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Education Level Step -->
          <div v-show="currentStep === 1" class="space-y-2">
            <Label for="education_level" class="text-xs sm:text-sm font-medium"
              >Education Level</Label
            >
            <Select v-model="form.education_level_id" @update:modelValue="handleLevelChange">
              <SelectTrigger id="education_level" class="text-xs sm:text-sm">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="level in educationLevels"
                  :key="level.id"
                  :value="level.id.toString()"
                  class="text-xs sm:text-sm"
                >
                  {{ level.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="form.errors.education_level_id" class="text-xs text-red-500">
              {{ form.errors.education_level_id }}
            </p>
          </div>

          <!-- Course Step -->
          <div v-show="currentStep === 2" class="space-y-2">
            <Label for="course" class="text-xs sm:text-sm font-medium">Course</Label>
            <Select v-model="form.course_id" @update:modelValue="handleCourseChange">
              <SelectTrigger id="course" class="text-xs sm:text-sm">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="course in filteredCourses"
                  :key="course.id"
                  :value="course.id.toString()"
                  class="text-xs sm:text-sm"
                >
                  {{ course.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="form.errors.course_id" class="text-xs text-red-500">
              {{ form.errors.course_id }}
            </p>
          </div>

          <!-- Institution Step -->
          <div v-show="currentStep === 3" class="space-y-2">
            <Label for="institution" class="text-xs sm:text-sm font-medium">Institution</Label>
            <Select v-model="form.institution_id">
              <SelectTrigger id="institution" class="text-xs sm:text-sm">
                <SelectValue placeholder="Select Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="institution in filteredInstitutions"
                  :key="institution.id"
                  :value="institution.id.toString()"
                  class="text-xs sm:text-sm"
                >
                  {{ institution.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="form.errors.institution_id" class="text-xs text-red-500">
              {{ form.errors.institution_id }}
            </p>
          </div>

          <!-- Graduation Year Step -->
          <div v-show="currentStep === 4" class="space-y-2">
            <Label for="graduation_year" class="text-xs sm:text-sm font-medium"
              >Expected Graduation Year</Label
            >
            <Select v-model="form.graduation_year">
              <SelectTrigger id="graduation_year" class="text-xs sm:text-sm">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="year in availableGraduationYears"
                  :key="year"
                  :value="year.toString()"
                  class="text-xs sm:text-sm"
                >
                  {{ year }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              @click="handlePreviousStep"
              v-if="currentStep > 1"
              class="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            >
              Back
            </Button>

            <Button
              type="submit"
              class="ml-auto text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 transition-colors duration-200"
              :disabled="!isStepValid || form.processing"
            >
              <Loader
                v-if="form.processing"
                class="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 animate-spin"
              />
              {{ currentStep === totalSteps ? 'Complete Setup' : 'Continue' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-card {
  background: linear-gradient(to bottom right, rgb(255, 255, 255), rgb(251, 251, 251));
}

/* Responsive styles for different screen sizes */
@media (min-width: 640px) {
  .bg-card {
    transition: box-shadow 0.2s ease;
  }

  .bg-card:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

@media (min-width: 768px) {
  .bg-card {
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.1),
      0 1px 2px 0 rgba(0, 0, 0, 0.06);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .bg-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
}

@media (min-width: 1024px) {
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }
}
</style>
