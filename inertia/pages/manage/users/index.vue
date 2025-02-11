<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'

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
}

const props = defineProps<Props>()

const updateRole = (userId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  useForm({ roleId: Number(target.value) }).put(`/manage/users/${userId}/role`)
}
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
    <div v-if="meta.last_page > 1" class="mt-6 flex justify-center gap-2">
      <Link
        v-for="page in meta.last_page"
        :key="page"
        :href="`/manage/users?page=${page}`"
        class="px-4 py-2 text-sm rounded-md"
        :class="{
          'bg-primary text-white': page === meta.current_page,
          'bg-gray-100 hover:bg-gray-200': page !== meta.current_page,
        }"
      >
        {{ page }}
      </Link>
    </div>
  </div>
</template>
