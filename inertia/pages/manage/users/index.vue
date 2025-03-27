<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'
import { ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { Search } from 'lucide-vue-next'
import debounce from 'lodash/debounce'

defineOptions({ layout: AdminLayout })

interface Props {
  users: UserDto[]
  totalUsers: number
  meta: {
    current_page: number
    last_page: number
    first_page: number
    per_page: number
  }
  filters?: {
    search?: string
  }
}

const props = defineProps<Props>()

const updateRole = (userId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  useForm({ roleId: Number(target.value) }).put(`/manage/users/${userId}/role`)
}

// Search functionality
const searchQuery = ref(props.filters?.search || '')

const performSearch = debounce(() => {
  router.get(
    '/manage/users',
    {
      search: searchQuery.value,
      page: 1, // Reset to page 1 when searching
    },
    {
      preserveState: true,
      replace: true,
    }
  )
}, 300)

watch(searchQuery, () => {
  performSearch()
})
</script>

<template>
  <AppHead title="Users" description="Manage users" />
  <div class="p-4 sm:p-8 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">User Management</h1>
      <div class="px-4 py-2 bg-primary/10 rounded-lg self-start sm:self-auto">
        <span class="text-primary font-medium">{{ totalUsers }} total users</span>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6 relative max-w-md">
      <Input
        v-model="searchQuery"
        type="search"
        placeholder="Search users by name or email..."
        class="pl-10"
      />
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>

    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full border-collapse min-w-[640px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600">
              Name
            </th>
            <th class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600">
              Email
            </th>
            <th class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600">
              Role
            </th>
            <th class="text-left px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 sm:px-6 py-4 text-sm">
              <div class="font-medium">{{ user.fullName }}</div>
            </td>
            <td class="px-4 sm:px-6 py-4 text-sm">
              <div class="truncate max-w-[200px]">{{ user.email }}</div>
            </td>
            <td class="px-4 sm:px-6 py-4 text-sm">{{ user.role?.name }}</td>
            <td class="px-4 sm:px-6 py-4">
              <select
                :value="user.roleId"
                @change="(e) => updateRole(user.id, e)"
                class="w-full sm:w-auto border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="1">User</option>
                <option :value="3">Editor</option>
                <option :value="4">Admin</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="meta.last_page > 1" class="mt-6 flex flex-wrap justify-center items-center gap-2">
      <!-- Previous button -->
      <Link
        :href="`/manage/users?page=${meta.current_page > 1 ? meta.current_page - 1 : 1}&search=${searchQuery}`"
        class="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 flex items-center"
        :class="{ 'opacity-50 pointer-events-none': meta.current_page === 1 }"
      >
        <span class="sr-only">Previous</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-left"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>

      <!-- First page -->
      <Link
        :href="`/manage/users?page=1&search=${searchQuery}`"
        class="px-3 py-2 text-sm rounded-md hidden sm:block"
        :class="{
          'bg-primary text-white': 1 === meta.current_page,
          'bg-gray-100 hover:bg-gray-200': 1 !== meta.current_page,
        }"
      >
        1
      </Link>

      <!-- Ellipsis if needed -->
      <span v-if="meta.current_page > 3" class="px-2 text-gray-500 hidden sm:block">...</span>

      <!-- Pages around current page -->
      <template v-for="page in meta.last_page" :key="page">
        <Link
          v-if="
            page !== 1 &&
            page !== meta.last_page &&
            (page === meta.current_page ||
              page === meta.current_page - 1 ||
              page === meta.current_page + 1 ||
              (page === 2 && meta.current_page === 1) ||
              (page === meta.last_page - 1 && meta.current_page === meta.last_page))
          "
          :href="`/manage/users?page=${page}&search=${searchQuery}`"
          class="px-3 py-2 text-sm rounded-md"
          :class="{
            'bg-primary text-white': page === meta.current_page,
            'bg-gray-100 hover:bg-gray-200': page !== meta.current_page,
          }"
        >
          {{ page }}
        </Link>
      </template>

      <!-- Ellipsis if needed -->
      <span v-if="meta.current_page < meta.last_page - 2" class="px-2 text-gray-500 hidden sm:block"
        >...</span
      >

      <!-- Last page -->
      <Link
        v-if="meta.last_page > 1"
        :href="`/manage/users?page=${meta.last_page}&search=${searchQuery}`"
        class="px-3 py-2 text-sm rounded-md hidden sm:block"
        :class="{
          'bg-primary text-white': meta.last_page === meta.current_page,
          'bg-gray-100 hover:bg-gray-200': meta.last_page !== meta.current_page,
        }"
      >
        {{ meta.last_page }}
      </Link>

      <!-- Mobile current page indicator -->
      <span class="px-3 py-2 text-sm sm:hidden">
        {{ meta.current_page }} of {{ meta.last_page }}
      </span>

      <!-- Next button -->
      <Link
        :href="`/manage/users?page=${meta.current_page < meta.last_page ? meta.current_page + 1 : meta.last_page}&search=${searchQuery}`"
        class="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 flex items-center"
        :class="{ 'opacity-50 pointer-events-none': meta.current_page === meta.last_page }"
      >
        <span class="sr-only">Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-right"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </div>
  </div>
</template>
