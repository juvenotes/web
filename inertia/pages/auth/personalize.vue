<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import type InstitutionDto from '#dtos/institution'
import type CourseDto from '#dtos/course'
import type EducationLevelDto from '#dtos/education_level'
import AuthLayout from '~/layouts/AuthLayout.vue'
import { ref, watch, computed } from 'vue'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

defineOptions({ layout: AuthLayout })

interface Props {
  institutions: InstitutionDto[]
  courses: CourseDto[]
  educationLevels: EducationLevelDto[]
}

const props = defineProps<Props>()

// Match DTO types
const form = useForm({
  education_level_id: 0,
  course_id: 0,
  institution_id: 0,
  graduation_year: 0
})

watch(() => form.education_level_id, (newValue) => {
  if (newValue) {
    form.course_id = 0
    form.institution_id = 0
  }
})

watch(() => form.course_id, (newValue) => {
  if (newValue) {
    form.institution_id = 0
  }
})

const filteredCourses = computed(() => {
  if (!form.education_level_id) return []
  return props.courses.filter(course => 
    course.education_level_id === form.education_level_id
  )
})

const filteredInstitutions = computed(() => {
  if (!form.course_id) return []
  return props.institutions.filter(institution => 
    institution.course_ids.includes(form.course_id)
  )
})

const graduationYears = computed(() => 
  Array.from({ length: 7 }, (_, i) => new Date().getFullYear() + i)
)

const validateForm = computed(() => ({
  isValid: Boolean(
    form.education_level_id &&
    form.course_id &&
    form.institution_id &&
    form.graduation_year
  )
}))

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!validateForm.value.isValid) return
  
  isSubmitting.value = true
  try {
    await form.post('/personalize')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-xl shadow-lg p-8 space-y-6">
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-semibold">Tell us about yourself</h1>
          <p class="text-sm text-muted-foreground">
            Help us personalize your learning experience
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Education Level -->
          <div class="space-y-2">
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
            <p v-if="form.errors.education_level_id" class="text-sm text-destructive">
              {{ form.errors.education_level_id }}
            </p>
          </div>

          <!-- Course -->
          <div v-if="form.education_level_id" class="space-y-2">
            <Select v-model="form.course_id">
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
            <p v-if="form.errors.course_id" class="text-sm text-destructive">
              {{ form.errors.course_id }}
            </p>
          </div>

          <!-- Institution -->
          <div v-if="form.course_id" class="space-y-2">
            <Select v-model="form.institution_id">
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
            <p v-if="form.errors.institution_id" class="text-sm text-destructive">
              {{ form.errors.institution_id }}
            </p>
          </div>

          <!-- Graduation Year -->
          <div v-if="form.institution_id" class="space-y-2">
            <Select v-model="form.graduation_year">
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
            <p v-if="form.errors.graduation_year" class="text-sm text-destructive">
              {{ form.errors.graduation_year }}
            </p>
          </div>

          <Button
            type="submit"
            class="w-full"
            :disabled="!validateForm.isValid || isSubmitting"
            :loading="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Continue' }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>