<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from '@inertiajs/vue3'
import axios from 'axios'
import OnboardingLayout from '~/layouts/OnboardingLayout.vue'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Loader, CheckCircle, ChevronRight } from 'lucide-vue-next'
import type EducationLevelDto from '#dtos/education_level'
import type CourseDto from '#dtos/course'
import type InstitutionDto from '#dtos/institution'

// Define the layout
defineOptions({ layout: OnboardingLayout })

// Define props
const props = defineProps<{
  educationLevels: EducationLevelDto[]
  returnUrl?: string
}>()

// Form state
const step = ref(1)
const totalSteps = 4

// Available data
const educationLevels = ref(props.educationLevels || [])
const courses = ref<CourseDto[]>([])
const institutions = ref<InstitutionDto[]>([])
const returnUrl = props.returnUrl || '/learn'

// Loading states
const loadingCourses = ref(false)
const loadingInstitutions = ref(false)

// Available graduation years (current year - 5 to current year + 10)
const currentYear = new Date().getFullYear()
const graduationYears = Array.from({ length: 16 }, (_, i) => (currentYear - 5 + i).toString())

// Form data
const form = useForm({
  educationLevelId: '',
  courseId: '',
  institutionId: '',
  graduationYear: (currentYear + 3).toString(), // Default to 3 years from now, as string
})

// Step titles
const stepTitles = [
  'Education Level',
  'Course',
  'Institution',
  'Graduation Year',
]

// Load courses when education level changes
async function loadCourses() {
  if (!form.educationLevelId) return
  
  try {
    loadingCourses.value = true
    const response = await axios.get(`/onboarding/courses?educationLevelId=${form.educationLevelId}`)
    courses.value = response.data
  } catch (error) {
    console.error('Failed to load courses:', error)
  } finally {
    loadingCourses.value = false
  }
}

// Load institutions
async function loadInstitutions() {
  try {
    loadingInstitutions.value = true
    const response = await axios.get('/onboarding/institutions')
    institutions.value = response.data
  } catch (error) {
    console.error('Failed to load institutions:', error)
  } finally {
    loadingInstitutions.value = false
  }
}

// Watch for changes in education level to load relevant courses
watch(() => form.educationLevelId, () => {
  form.courseId = ''
  loadCourses()
})

// Watch for changes in course to reset institution selection
watch(() => form.courseId, () => {
  form.institutionId = ''
  // Once a course is selected, load institutions if they haven't been loaded yet
  if (form.courseId && institutions.value.length === 0) {
    loadInstitutions()
  }
})

// Methods for navigation
const nextStep = () => {
  if (step.value < totalSteps) {
    step.value++
  } else {
    submitForm()
  }
}

const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const submitForm = () => {
  form.post('/onboarding', {
    preserveScroll: true,
    // The success redirect is handled server-side and will use the stored returnUrl
  })
}

// Check if current step is valid
const isStepValid = computed(() => {
  switch (step.value) {
    case 1:
      return !!form.educationLevelId
    case 2:
      return !!form.courseId
    case 3:
      return !!form.institutionId
    case 4:
      return !!form.graduationYear
    default:
      return false
  }
})
</script>

<template>
  <AppHead title="Complete Your Profile" description="Personalize your learning journey" />

  <div class="space-y-8">
    <!-- Progress indicator -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">Complete Your Profile</h2>
        <div class="text-sm text-gray-500">Step {{ step }} of {{ totalSteps }}</div>
      </div>
      
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary transition-all duration-300" 
          :style="{ width: `${(step / totalSteps) * 100}%` }"
        ></div>
      </div>
      
      <!-- Step indicators -->
      <div class="flex justify-between mt-2">
        <div
          v-for="i in totalSteps"
          :key="i"
          class="flex flex-col items-center"
          :class="{ 'opacity-50': i > step }"
        >
          <div 
            class="w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors"
            :class="[
              i < step ? 'bg-primary border-primary text-white' : 
              i === step ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'
            ]"
          >
            <CheckCircle v-if="i < step" class="h-5 w-5" />
            <span v-else>{{ i }}</span>
          </div>
          <span class="text-xs mt-1 hidden sm:block">{{ stepTitles[i-1] }}</span>
        </div>
      </div>
    </div>

    <!-- Personalization message with required notice -->
    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <p class="text-sm text-blue-700">
        <strong>This step is required to continue.</strong> This information helps us personalize your learning experience and provide you with relevant resources and materials.
      </p>
    </div>

    <!-- Form steps -->
    <div>
      <!-- Step 1: Education Level -->
      <div v-show="step === 1" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-800">What is your education level?</h3>
        <div>
          <Label for="educationLevel">Select your education level</Label>
          <Select v-model="form.educationLevelId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select an education level" />
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
          <p v-if="form.errors.educationLevelId" class="mt-1 text-sm text-red-500">
            {{ form.errors.educationLevelId }}
          </p>
        </div>
      </div>

      <!-- Step 2: Course -->
      <div v-show="step === 2" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-800">What course are (or did) you studying?</h3>
        <div>
          <Label for="course">Select one</Label>
          <Select v-model="form.courseId" :disabled="loadingCourses || courses.length === 0">
            <SelectTrigger class="w-full">
              <span v-if="loadingCourses" class="flex items-center">
                <Loader class="animate-spin h-4 w-4 mr-2" />
                Loading courses...
              </span>
              <SelectValue v-else placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="course in courses"
                :key="course.id"
                :value="course.id.toString()"
              >
                {{ course.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.courseId" class="mt-1 text-sm text-red-500">
            {{ form.errors.courseId }}
          </p>
          <p v-if="courses.length === 0 && !loadingCourses && form.educationLevelId" class="mt-1 text-sm text-gray-500">
            No courses available for the selected education level.
          </p>
        </div>
      </div>

      <!-- Step 3: Institution -->
      <div v-show="step === 3" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-800">Where are (or were) you studying?</h3>
        <div>
          <Label for="institution">Select your institution</Label>
          <Select v-model="form.institutionId" :disabled="loadingInstitutions || institutions.length === 0">
            <SelectTrigger class="w-full">
              <span v-if="loadingInstitutions" class="flex items-center">
                <Loader class="animate-spin h-4 w-4 mr-2" />
                Loading institutions...
              </span>
              <SelectValue v-else placeholder="Select an institution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="institution in institutions"
                :key="institution.id"
                :value="institution.id.toString()"
              >
                {{ institution.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.institutionId" class="mt-1 text-sm text-red-500">
            {{ form.errors.institutionId }}
          </p>
        </div>
      </div>

      <!-- Step 4: Graduation Year -->
      <div v-show="step === 4" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-800">Graduation year?</h3>
        <div>
          <Label for="graduationYear">Graduation year</Label>
          <Select v-model="form.graduationYear">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select your graduation year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="year in graduationYears"
                :key="year"
                :value="year"
              >
                {{ year }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.graduationYear" class="mt-1 text-sm text-red-500">
            {{ form.errors.graduationYear }}
          </p>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="flex justify-between mt-8">
        <Button 
          v-if="step > 1" 
          variant="outline"
          @click="prevStep"
          :disabled="form.processing"
        >
          Previous
        </Button>
        <div v-else class="w-24"></div>
        
        <Button 
          @click="nextStep" 
          class="flex items-center gap-2"
          :disabled="!isStepValid || form.processing"
        >
          <span>{{ step === totalSteps ? 'Complete' : 'Next' }}</span>
          <Loader v-if="form.processing" class="h-4 w-4 animate-spin" />
          <ChevronRight v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Message about required fields -->
    <div class="text-center mt-4">
      <p class="text-sm text-gray-500">
        All fields are required to personalize your learning experience.
      </p>
    </div>
  </div>
</template>
