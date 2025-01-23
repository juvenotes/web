<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'
import AppLayout from '~/layouts/AppLayout.vue'
import { Settings, ArrowLeft } from 'lucide-vue-next'

defineOptions({ layout: AppLayout })

defineProps<{ user: UserDto }>()

// Email update form
const emailForm = useForm({
  email: '',
  password: '',
})

// Form handlers
const updateEmail = () => {
  emailForm.put('/settings/account/email', {
    onSuccess: () => emailForm.reset(),
  })
}
</script>

<template>
  <AppHead title="Your Account" description="Manage your account settings here" />
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <Link
          href="/learn"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div class="flex items-center gap-2">
          <Settings class="h-5 w-5" />
          <h1 class="text-2xl font-semibold">Account Settings</h1>
        </div>
      </div>
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
          class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
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

      <button
        class="mt-4 bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
        @click="$inertia.delete('/settings/account')"
      >
        Delete Account
      </button>
    </div>
  </div>
</template>
