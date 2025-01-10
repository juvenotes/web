<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import type InstitutionDto from '#dtos/institution'
import type CourseDto from '#dtos/course'
import type EducationLevelDto from '#dtos/education_level'
import AuthLayout from '~/layouts/AuthLayout.vue'

defineOptions({ layout: AuthLayout })

defineProps<{
  institutions: InstitutionDto[]
  courses: CourseDto[]
  educationLevels: EducationLevelDto[]
}>()

const form = useForm({
  education_level_id: '',
  course_id: '',
  institution_id: '',
  graduation_year: ''
})

const filteredCourses = ref<CourseDto[]>([])
const filteredInstitutions = ref<InstitutionDto[]>([])

watch(() => form.education_level_id, (newValue) => {
  form.course_id = ''
  form.institution_id = ''
  if (newValue) {
    filteredCourses.value = props.courses.filter(
      c => c.educationLevelId === Number(newValue)
    )
  }
})

watch(() => form.course_id, (newValue) => {
  form.institution_id = ''
  if (newValue) {
    filteredInstitutions.value = props.institutions.filter(
      i => i.courses.some(c => 
        c.id === Number(newValue) && 
        c.educationLevelId === Number(form.education_level_id)
      )
    )
  }
})

const graduationYears = Array.from(
  { length: 7 }, 
  (_, i) => new Date().getFullYear() + i
)
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-xl shadow-lg p-8 space-y-6">
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-semibold">Tell us about yourself</h1>
          <p class="text-sm text-muted-foreground">Help us personalize your learning experience</p>
        </div>

        <form @submit.prevent="form.post('/personalize')" class="space-y-4">
          <!-- Education Level -->
          <Select v-model="form.education_level_id">
            <SelectTrigger>
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="level in educationLevels"
                :key="level.id"
                :value="level.id"
              >
                {{ level.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Course (only shown if education level selected) -->
          <Select 
            v-if="form.education_level_id"
            v-model="form.course_id"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="course in filteredCourses"
                :key="course.id"
                :value="course.id"
              >
                {{ course.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Institution (only shown if course selected) -->
          <Select
            v-if="form.course_id"
            v-model="form.institution_id"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your institution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="institution in filteredInstitutions"
                :key="institution.id"
                :value="institution.id"
              >
                {{ institution.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Graduation Year (shown last) -->
          <Select
            v-if="form.institution_id"
            v-model="form.graduation_year"
          >
            <SelectTrigger>
              <SelectValue placeholder="Expected graduation year" />
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

          <Button 
            type="submit" 
            class="w-full"
            :disabled="!form.graduation_year"
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
