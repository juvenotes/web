<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { computed, ref } from 'vue'
import { useForm } from '@inertiajs/vue3'
import type InstitutionDto from '#dtos/institution'
import { InstitutionType, InstitutionTypeLabels } from '#enums/institution_type'
import { Loader2Icon } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

interface Props {
  institutions: InstitutionDto[]
}

const institutionTypes = computed(() =>
  Object.entries(InstitutionType).map(([, value]) => ({
    label: InstitutionTypeLabels[value],
    value: value,
  }))
)

const props = defineProps<Props>()
const isOpen = ref(false)

const institutionsByType = computed(() => {
  return props.institutions.reduce(
    (acc, institution) => {
      const type = institution.institutionType || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(institution)
      return acc
    },
    {} as Record<string, InstitutionDto[]>
  )
})

const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

const form = useForm({
  name: '',
  institutionType: '',
  branch: '',
})

const onSubmit = () => {
  form.post('/manage/institutions', {
    onSuccess: () => {
      isOpen.value = false
      form.reset()
    },
    onError: (errors) => {
      console.error('Form submission failed:', errors)
    },
  })
}
</script>

<template>
  <AppHead title="All available institutions" description="Institutions" />
  <div class="container py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Institutions</h1>

      <Sheet v-model:open="isOpen">
        <SheetTrigger asChild>
          <Button>Add Institution</Button>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Institution</SheetTitle>
            <SheetDescription>
              Create a new institution to manage courses and programs.
            </SheetDescription>
          </SheetHeader>

          <form @submit.prevent="onSubmit" class="space-y-4 mt-4">
            <div class="space-y-2">
              <label>Name</label>
              <Input v-model="form.name" type="text" required />
            </div>

            <div class="space-y-2">
              <label>Type</label>
              <Select v-model="form.institutionType">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in institutionTypes"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <label>Branch (Optional)</label>
              <Input v-model="form.branch" type="text" />
            </div>

            <SheetFooter>
              <Button
                type="submit"
                :disabled="form.processing || !form.name || !form.institutionType"
                class="gap-2"
              >
                <Loader2Icon v-if="form.processing" class="h-4 w-4 animate-spin" />
                {{ form.processing ? 'Creating...' : 'Create Institution' }}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>

    <!-- Institutions List -->
    <div v-for="(institutions, type) in institutionsByType" :key="type" class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">{{ formatType(type) }}</h2>

      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full border-collapse min-w-[640px]">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600"
              >
                Name
              </th>
              <th
                class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600"
              >
                Branch
              </th>
              <th
                class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600"
              >
                Courses
              </th>
              <th
                class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="institution in institutions"
              :key="institution.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="() => $inertia.visit(`/manage/institutions/${institution.id}`)"
            >
              <td class="px-4 sm:px-6 py-4 text-sm">
                <div class="font-medium text-primary">{{ institution.name }}</div>
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm">
                {{ institution.branch || '-' }}
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm">
                {{ institution.courses?.length ?? 0 }} courses
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="
                    institution.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  "
                >
                  {{ institution.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
