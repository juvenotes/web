<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'
import AppLayout from '~/layouts/AppLayout.vue'
import { Settings } from 'lucide-vue-next'

defineOptions({ layout: AppLayout })

defineProps<{ user: UserDto }>()

// Email update form
const emailForm = useForm({
  email: '',
  password: ''
})

// Account deletion form
const deleteForm = useForm({
  email: ''
})

// Form handlers
const updateEmail = () => {
  emailForm.put('/settings/account/email', {
    onSuccess: () => emailForm.reset()
  })
}

const deleteAccount = () => {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
  deleteForm.delete('/settings/account')
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="flex items-center gap-2">
      <Settings class="h-5 w-5" />
      <h1 class="text-2xl font-semibold">Account Settings</h1>
    </div>

    <!-- Email Update Section -->
    <div class="bg-white p-6 rounded-lg border space-y-4">
      <div>
        <h2 class="text-lg font-medium">Email Address</h2>
        <p class="text-sm text-muted-foreground">Current email: {{ user.email }}</p>
      </div>

      <form @submit.prevent="updateEmail" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">New Email</label>
          <input
            v-model="emailForm.email"
            type="email"
            class="w-full p-2 rounded-md border"
            required
          />
          <span v-if="emailForm.errors.email" class="text-sm text-destructive">
            {{ emailForm.errors.email }}
          </span>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Current Password</label>
          <input
            v-model="emailForm.password"
            type="password"
            class="w-full p-2 rounded-md border"
            required
          />
          <span v-if="emailForm.errors.password" class="text-sm text-destructive">
            {{ emailForm.errors.password }}
          </span>
        </div>

        <button
          type="submit"
          class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          :disabled="emailForm.processing"
        >
          {{ emailForm.processing ? 'Updating...' : 'Update Email' }}
        </button>
      </form>
    </div>

    <!-- Delete Account Section -->
    <div class="bg-destructive/5 p-6 rounded-lg border border-destructive/20">
      <h2 class="text-lg font-medium text-destructive">Delete Account</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Once your account is deleted, all of your data will be permanently removed.
      </p>

      <form @submit.prevent="deleteAccount" class="mt-4 space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Confirm Email</label>
          <input
            v-model="deleteForm.email"
            type="email"
            class="w-full p-2 rounded-md border"
            placeholder="Enter your email to confirm"
            required
          />
          <span v-if="deleteForm.errors.email" class="text-sm text-destructive">
            {{ deleteForm.errors.email }}
          </span>
        </div>

        <button
          type="submit"
          class="bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90"
          :disabled="deleteForm.processing"
        >
          {{ deleteForm.processing ? 'Deleting...' : 'Delete Account' }}
        </button>
      </form>
    </div>
  </div>
</template>