<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'

defineOptions({ layout: AdminLayout })

defineProps<{
  users: UserDto[]
}>()

const updateRole = (userId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  useForm({ roleId: Number(target.value) }).put(`/manage/users/${userId}/role`)
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">User Management</h1>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
            <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
            <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
            <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">{{ user.fullName }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">{{ user.role?.name }}</td>
            <td class="px-6 py-4">
              <select
                :value="user.roleId"
                @change="(e) => updateRole(user.id, e)"
                class="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
  </div>
</template>
