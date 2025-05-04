<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { computed, ref } from 'vue'
import { useForm } from '@inertiajs/vue3'
import type CourseDto from '#dtos/course'
import type EducationLevelDto from '#dtos/education_level'
import { GraduationCap, Plus, School, Pencil, Trash2 } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

interface Props {
  courses: CourseDto[]
  educationLevels: EducationLevelDto[]
}

const props = defineProps<Props>()
const isOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const courseToDelete = ref<CourseDto | null>(null)

// Group courses by education level for better display
const coursesByLevel = computed(() => {
  const grouped: Record<number, CourseDto[]> = {}

  props.courses.forEach((course) => {
    const levelId = course.educationLevelId || 0
    if (!grouped[levelId]) {
      grouped[levelId] = []
    }
    grouped[levelId].push(course)
  })

  return grouped
})

// Get education level name by id
const getEducationLevelName = (levelId: number) => {
  const level = props.educationLevels.find((l) => l.id === levelId)
  return level ? level.name : 'Unknown'
}

// Form for creating a new course
const form = useForm({
  name: '',
  educationLevelId: props.educationLevels[0]?.id || 0,
})

// Delete form
const deleteForm = useForm({})

// Form submission handler
const onSubmit = () => {
  form.post('/manage/courses', {
    onSuccess: () => {
      form.reset()
      isOpen.value = false
    },
  })
}

// Delete confirmation handler
const confirmDelete = (course: CourseDto) => {
  courseToDelete.value = course
  isDeleteDialogOpen.value = true
}

// Delete handler
const onDelete = () => {
  if (!courseToDelete.value) return

  deleteForm.delete(`/manage/courses/${courseToDelete.value.id}`, {
    onSuccess: () => {
      isDeleteDialogOpen.value = false
      courseToDelete.value = null
    },
  })
}
</script>

<template>
  <AppHead title="Course Management" description="Manage education courses" />

  <div class="space-y-6">
    <!-- Header section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Course Management</h1>
        <p class="text-muted-foreground">Manage courses offered by educational institutions.</p>
      </div>

      <!-- Create Course Sheet -->
      <Sheet v-model:open="isOpen">
        <SheetTrigger asChild>
          <Button class="gap-2">
            <Plus class="h-4 w-4" />
            Add Course
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Course</SheetTitle>
            <SheetDescription>
              Add a new course to the system. Courses can be assigned to institutions.
            </SheetDescription>
          </SheetHeader>

          <form @submit.prevent="onSubmit" class="space-y-6 mt-6">
            <div class="space-y-2">
              <Label for="name">Course Name</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="e.g., Medicine, Computer Science"
                :error="form.errors.name"
              />
              <p v-if="form.errors.name" class="text-sm text-destructive">{{ form.errors.name }}</p>
            </div>

            <div class="space-y-2">
              <Label for="educationLevel">Education Level</Label>
              <Select v-model="form.educationLevelId">
                <SelectTrigger :error="form.errors.educationLevelId">
                  <SelectValue placeholder="Select Education Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="level in educationLevels" :key="level.id" :value="level.id">
                    {{ level.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="form.errors.educationLevelId" class="text-sm text-destructive">
                {{ form.errors.educationLevelId }}
              </p>
            </div>

            <SheetFooter>
              <Button type="submit" :disabled="form.processing">
                {{ form.processing ? 'Creating...' : 'Create Course' }}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>

    <!-- Course lists by education level -->
    <div v-for="(courses, levelId) in coursesByLevel" :key="levelId" class="space-y-4">
      <div class="flex items-center gap-2">
        <GraduationCap class="h-5 w-5 text-primary" />
        <h2 class="text-lg font-semibold">{{ getEducationLevelName(Number(levelId)) }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="course in courses" :key="course.id" class="overflow-hidden">
          <CardHeader class="pb-3">
            <CardTitle>{{ course.name }}</CardTitle>
            <CardDescription>
              <div class="flex items-center gap-1">
                <School class="h-4 w-4" />
                <span>{{ course.institutions.length }} institutions</span>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent class="pb-2 pt-0"></CardContent>

          <CardFooter class="flex justify-between border-t pt-4">
            <Button variant="outline" asChild>
              <Link :href="`/manage/courses/${course.id}`"> View Details </Link>
            </Button>
            <div class="flex space-x-2">
              <Button variant="outline" size="icon" asChild>
                <Link :href="`/manage/courses/${course.id}`">
                  <Pencil class="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="text-destructive hover:bg-destructive/10"
                @click="confirmDelete(course)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="courses.length === 0" class="text-center py-12">
      <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <GraduationCap class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium">No courses yet</h3>
      <p class="text-muted-foreground mt-2 mb-4">Create your first course to get started.</p>
      <Button @click="isOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Add Your First Course
      </Button>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ courseToDelete?.name }}"? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="isDeleteDialogOpen = false">Cancel</Button>
          <Button variant="destructive" @click="onDelete" :disabled="deleteForm.processing">
            {{ deleteForm.processing ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
