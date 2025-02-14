<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import type InstitutionDto from '#dtos/institution'
import { computed } from 'vue'

defineOptions({ layout: AdminLayout })

interface Props {
  institutions: InstitutionDto[]
}

const props = defineProps<Props>()

// Group institutions by type
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

// Format institution type for display
const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}
</script>

<template>
  <AppHead title="Institutions" description="Manage institutions" />
  <div class="p-4 sm:p-8 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Institution Management</h1>
      <div class="px-4 py-2 bg-primary/10 rounded-lg self-start sm:self-auto">
        <span class="text-primary font-medium">{{ institutions.length }} total institutions</span>
      </div>
    </div>

    <!-- Group institutions by type -->
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
