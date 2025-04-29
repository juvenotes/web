<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { ref } from 'vue'
import { useForm } from '@inertiajs/vue3'
import type InstitutionDto from '#dtos/institution'
import { School, Plus, GraduationCap, Pencil, Trash2 } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

interface Props {
  institutions: InstitutionDto[]
}

defineProps<Props>()
const isOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const institutionToDelete = ref<InstitutionDto | null>(null)

// Form for creating a new institution
const form = useForm({
  name: '',
  description: '',
})

// Delete form
const deleteForm = useForm({})

// Form submission handler
const onSubmit = () => {
  form.post('/manage/institutions', {
    onSuccess: () => {
      form.reset()
      isOpen.value = false
    },
  })
}

// Delete confirmation handler
const confirmDelete = (institution: InstitutionDto) => {
  institutionToDelete.value = institution
  isDeleteDialogOpen.value = true
}

// Delete handler
const onDelete = () => {
  if (!institutionToDelete.value) return

  deleteForm.delete(`/manage/institutions/${institutionToDelete.value.id}`, {
    onSuccess: () => {
      isDeleteDialogOpen.value = false
      institutionToDelete.value = null
    },
  })
}
</script>

<template>
  <AppHead title="Institution Management" description="Manage educational institutions" />

  <div class="space-y-6">
    <!-- Header section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Institution Management</h1>
        <p class="text-muted-foreground">
          Manage educational institutions and their associated courses.
        </p>
      </div>

      <!-- Create Institution Sheet -->
      <Sheet v-model:open="isOpen">
        <SheetTrigger asChild>
          <Button class="gap-2">
            <Plus class="h-4 w-4" />
            Add Institution
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Institution</SheetTitle>
            <SheetDescription> Add a new educational institution to the system. </SheetDescription>
          </SheetHeader>

          <form @submit.prevent="onSubmit" class="space-y-6 mt-6">
            <div class="space-y-2">
              <Label for="name">Institution Name</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="e.g., Oxford University"
                :error="form.errors.name"
              />
              <p v-if="form.errors.name" class="text-sm text-destructive">{{ form.errors.name }}</p>
            </div>

            <div class="space-y-2">
              <Label for="description">Description (Optional)</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Brief description of the institution"
              />
            </div>

            <SheetFooter>
              <Button type="submit" :disabled="form.processing">
                {{ form.processing ? 'Creating...' : 'Create Institution' }}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>

    <!-- Institutions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="institution in institutions" :key="institution.id" class="overflow-hidden">
        <CardHeader>
          <CardTitle>{{ institution.name }}</CardTitle>
        </CardHeader>

        <CardContent>
          <div class="flex items-center gap-2">
            <GraduationCap class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">
              {{ institution.courses.length }} courses
            </span>
          </div>
        </CardContent>

        <CardFooter class="flex justify-between border-t pt-4">
          <Button variant="outline" asChild>
            <Link :href="`/manage/institutions/${institution.id}`"> View Details </Link>
          </Button>
          <div class="flex space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link :href="`/manage/institutions/${institution.id}`">
                <Pencil class="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="text-destructive hover:bg-destructive/10"
              @click="confirmDelete(institution)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>

    <!-- Empty state -->
    <div v-if="institutions.length === 0" class="text-center py-12">
      <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <School class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium">No institutions yet</h3>
      <p class="text-muted-foreground mt-2 mb-4">Create your first institution to get started.</p>
      <Button @click="isOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Add Your First Institution
      </Button>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Institution</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ institutionToDelete?.name }}"? This action cannot be
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
