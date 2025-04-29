<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Link } from '@inertiajs/vue3'
import type InstitutionDto from '#dtos/institution'
import { ArrowLeft, GraduationCap, School, Plus, Edit, Trash2, Loader2Icon } from 'lucide-vue-next'
import { useForm } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

defineOptions({ layout: AdminLayout })

interface Course {
  id: number
  name: string
  educationLevels: Array<{ id: number; name: string }>
}

interface CourseLevel {
  levelName: string
  courses: Course[]
}

interface Props {
  institution: InstitutionDto
  coursesByLevel: Record<number, CourseLevel>
  educationLevels: Array<{ id: number; name: string }>
  availableCourses: Array<Course>
}

const props = defineProps<Props>()
const isEditOpen = ref(false)
const isCoursesOpen = ref(false)
const isDeleteOpen = ref(false)

// Edit Institution Form
const editForm = useForm({
  name: props.institution.name,
})

// Manage Courses Form
const coursesForm = useForm({
  courses: Object.entries(props.coursesByLevel).flatMap(([levelId, level]) =>
    level.courses.map((course) => ({
      courseId: course.id,
      educationLevelId: parseInt(levelId),
    }))
  ),
})

// Form submission handlers
const onEditSubmit = () => {
  editForm.put(`/manage/institutions/${props.institution.id}`, {
    onSuccess: () => {
      isEditOpen.value = false
    },
  })
}

const onCoursesSubmit = () => {
  coursesForm.put(`/manage/institutions/${props.institution.id}/courses`, {
    onSuccess: () => {
      isCoursesOpen.value = false
    },
  })
}

const deleteForm = useForm({})
const onDelete = () => {
  deleteForm.delete(`/manage/institutions/${props.institution.id}`, {
    onSuccess: () => {
      isDeleteOpen.value = false
      window.location.href = '/manage/institutions'
    },
  })
}

// Helper to check if a course is available for a specific education level
const isCourseAvailableForLevel = (course: Course, levelId: number) => {
  return course.educationLevels.some((level) => level.id === levelId)
}

// Helper to get courses filtered by education level
const getCoursesForLevel = computed(() => (levelId: number) => {
  return props.availableCourses.filter((course) => isCourseAvailableForLevel(course, levelId))
})
</script>

<template>
  <AppHead :title="institution.name" description="Institution details" />
  <div class="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Link
          href="/manage/institutions"
          class="flex items-center gap-2 text-primary hover:text-primary/70"
        >
          <ArrowLeft class="h-5 w-5" />
          <span class="text-sm font-medium">Back</span>
        </Link>
      </div>

      <div class="flex items-center gap-2">
        <!-- Edit Institution Sheet -->
        <Sheet v-model:open="isEditOpen">
          <SheetTrigger asChild>
            <Button variant="outline" class="gap-2">
              <Edit class="h-4 w-4" />
              Edit Details
            </Button>
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Institution</SheetTitle>
              <SheetDescription>Update institution details</SheetDescription>
            </SheetHeader>

            <form @submit.prevent="onEditSubmit" class="space-y-4 mt-4">
              <div class="space-y-4">
                <div class="space-y-2">
                  <label>Name</label>
                  <Input v-model="editForm.name" type="text" required />
                </div>
              </div>

              <SheetFooter>
                <Button type="submit" :loading="editForm.processing"> Save Changes </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <!-- Manage Courses Sheet -->
        <Sheet v-model:open="isCoursesOpen">
          <SheetTrigger asChild>
            <Button class="gap-2">
              <Plus class="h-4 w-4" />
              Manage Courses
            </Button>
          </SheetTrigger>

          <SheetContent class="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Manage Courses</SheetTitle>
              <SheetDescription>Add or remove courses for this institution</SheetDescription>
            </SheetHeader>

            <form @submit.prevent="onCoursesSubmit" class="mt-6">
              <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                <div v-for="level in educationLevels" :key="level.id" class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-foreground">{{ level.name }}</h3>
                    <span class="text-xs text-muted-foreground">
                      {{
                        coursesForm.courses.filter((c) => c.educationLevelId === level.id).length
                      }}
                      selected
                    </span>
                  </div>

                  <div class="grid grid-cols-1 gap-2 pl-2">
                    <label
                      v-for="course in getCoursesForLevel(level.id)"
                      :key="`${level.id}-${course.id}`"
                      class="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :id="`course-${course.id}-${level.id}`"
                        :checked="
                          coursesForm.courses.some(
                            (c) => c.courseId === course.id && c.educationLevelId === level.id
                          )
                        "
                        @change="
                          (e: Event) => {
                            const target = e.target as HTMLInputElement
                            if (!target) return

                            if (target.checked) {
                              coursesForm.courses.push({
                                courseId: course.id,
                                educationLevelId: level.id,
                              })
                            } else {
                              const idx = coursesForm.courses.findIndex(
                                (c) => c.courseId === course.id && c.educationLevelId === level.id
                              )
                              if (idx > -1) coursesForm.courses.splice(idx, 1)
                            }
                          }
                        "
                        class="rounded border-input"
                      />
                      <div class="flex flex-col">
                        <span class="text-sm font-medium">{{ course.name }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-6 border-t pt-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-foreground">
                    {{ coursesForm.courses.length }} courses selected
                  </p>
                  <Button type="submit" :disabled="coursesForm.processing" class="gap-2">
                    <Loader2Icon v-if="coursesForm.processing" class="h-4 w-4 animate-spin" />
                    {{ coursesForm.processing ? 'Saving...' : 'Save Changes' }}
                  </Button>
                </div>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        <!-- Delete Button -->
        <Button variant="destructive" class="gap-2" @click="isDeleteOpen = true">
          <Trash2 class="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Institution Info Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ institution.name }}</h1>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div class="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <School class="h-5 w-5 text-primary" />
          <div>
            <p class="text-sm text-gray-600">Total Courses</p>
            <p class="text-xl font-semibold text-primary">
              {{
                Object.values(coursesByLevel).reduce((sum, level) => sum + level.courses.length, 0)
              }}
            </p>
          </div>
        </div>

        <div class="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <GraduationCap class="h-5 w-5 text-primary" />
          <div>
            <p class="text-sm text-gray-600">Education Levels</p>
            <p class="text-xl font-semibold text-primary">
              {{ Object.keys(coursesByLevel).length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Courses by Level -->
    <div
      v-for="(level, levelId) in coursesByLevel"
      :key="levelId"
      class="bg-white rounded-lg shadow"
    >
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">{{ level.levelName }}</h2>
      </div>

      <div class="p-4">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="course in level.courses"
            :key="course.id"
            class="p-4 rounded-lg border bg-gray-50/50"
          >
            <h3 class="font-medium text-gray-900">{{ course.name }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Institution</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this institution? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="isDeleteOpen = false">Cancel</Button>
          <Button
            variant="destructive"
            :disabled="deleteForm.processing"
            :loading="deleteForm.processing"
            @click="onDelete"
          >
            {{ deleteForm.processing ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
