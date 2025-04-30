<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Link } from '@inertiajs/vue3'
import { useForm } from '@inertiajs/vue3'
import { ArrowLeft, School, Edit, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import type CourseDto from '#dtos/course'
import type EducationLevelDto from '#dtos/education_level'

defineOptions({ layout: AdminLayout })

interface Props {
  course: CourseDto
  educationLevels: EducationLevelDto[]
}

const props = defineProps<Props>()

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

// Form for editing the course
const editForm = useForm({
  name: props.course.name,
  educationLevelId: props.course.educationLevelId
})

// Form for confirming deletion
const deleteForm = useForm({})

// Submit handler for editing the course
const onEditSubmit = () => {
  editForm.put(`/manage/courses/${props.course.id}`, {
    onSuccess: () => {
      isEditOpen.value = false
    }
  })
}

// Submit handler for deleting the course
const onDelete = () => {
  deleteForm.delete(`/manage/courses/${props.course.id}`, {
    onSuccess: () => {
      window.location.href = '/manage/courses'
    }
  })
}
</script>

<template>
  <AppHead :title="course.name" description="Course details" />
  <div class="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Link href="/manage/courses" class="text-muted-foreground hover:text-primary">
          <ArrowLeft class="h-5 w-5" />
        </Link>
        <h1 class="text-xl font-semibold">Course Details</h1>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Edit Button -->
        <Sheet v-model:open="isEditOpen">
          <SheetTrigger asChild>
            <Button variant="outline" class="gap-2">
              <Edit class="h-4 w-4" />
              Edit
            </Button>
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Course</SheetTitle>
              <SheetDescription>
                Update the course details.
              </SheetDescription>
            </SheetHeader>

            <form @submit.prevent="onEditSubmit" class="mt-6 space-y-6">
              <div class="space-y-2">
                <Label for="name">Course Name</Label>
                <Input
                  id="name"
                  v-model="editForm.name"
                  :error="editForm.errors.name"
                />
                <p v-if="editForm.errors.name" class="text-sm text-red-500">{{ editForm.errors.name }}</p>
              </div>

              <div class="space-y-2">
                <Label for="educationLevel">Education Level</Label>
                <Select v-model="editForm.educationLevelId">
                  <SelectTrigger :error="editForm.errors.educationLevelId">
                    <SelectValue placeholder="Select Education Level" />
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
                <p v-if="editForm.errors.educationLevelId" class="text-sm text-red-500">
                  {{ editForm.errors.educationLevelId }}
                </p>
              </div>

              <SheetFooter>
                <Button type="submit" :disabled="editForm.processing">
                  {{ editForm.processing ? 'Saving...' : 'Save Changes' }}
                </Button>
              </SheetFooter>
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

    <!-- Course Info Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ course.name }}</h1>
          <p class="text-gray-500 mt-1">
            {{ course.educationLevel?.name || 'No education level assigned' }}
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mt-6">
        <div class="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <School class="h-5 w-5 text-primary" />
          <div>
            <p class="text-sm text-gray-600">Institutions offering this course</p>
            <p class="text-xl font-semibold text-primary">
              {{ course.institutions.length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Institutions List -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">Institutions Offering This Course</h2>
      </div>

      <div class="p-4">
        <div v-if="course.institutions.length > 0" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="institution in course.institutions"
            :key="institution.id"
            class="p-4 rounded-lg border bg-gray-50/50"
          >
            <Link 
              :href="`/manage/institutions/${institution.id}`" 
              class="hover:underline font-medium text-primary"
            >
              {{ institution.name }}
            </Link>
          </div>
        </div>
        <div v-else class="text-center py-6 text-gray-500">
          No institutions are offering this course yet.
          <br>
          You can add courses to institutions from the institutions management page.
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this course? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="isDeleteOpen = false">Cancel</Button>
          <Button variant="destructive" @click="onDelete" :disabled="deleteForm.processing">
            {{ deleteForm.processing ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>