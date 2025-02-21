<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'
import AppLayout from '~/layouts/AppLayout.vue'
import { User, ArrowLeft } from 'lucide-vue-next'

defineOptions({ layout: AppLayout })

const props = defineProps<{ user: UserDto }>()

// Profile update form
const form = useForm({
  fullName: props.user.fullName || '',
  username: props.user.username || '',
})

// Form handler
const updateProfile = () => {
  form.put('/settings/profile', {
    onSuccess: () => form.reset(),
  })
}
</script>

<template>
  <AppHead title="Your Profile" description="Manage your profile settings here" />
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
          <User class="h-5 w-5" />
          <h1 class="text-2xl font-semibold">Profile Settings</h1>
        </div>
      </div>
    </div>

    <!-- Profile Update Section -->
    <div class="bg-white p-6 rounded-lg border space-y-4">
      <div>
        <h2 class="text-lg font-medium">Your Profile</h2>
        <p class="text-sm text-muted-foreground">Update your profile information.</p>
      </div>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Full Name</label>
          <input
            v-model="form.fullName"
            type="text"
            class="w-full p-2 rounded-md border"
            required
          />
          <span v-if="form.errors.fullName" class="text-sm text-destructive">
            {{ form.errors.fullName }}
          </span>
        </div>
        <!-- <div class="space-y-2">
          <label class="text-sm font-medium">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="w-full p-2 rounded-md border"
            pattern="[a-z0-9-]+"
            required
          />
          <p class="text-sm text-muted-foreground">
            Only lowercase letters, numbers, and hyphens allowed
          </p>
          <span v-if="form.errors.username" class="text-sm text-destructive">
            {{ form.errors.username }}
          </span>
        </div> -->

        <button
          type="submit"
          class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          :disabled="form.processing"
        >
          {{ form.processing ? 'Updating...' : 'Update Profile' }}
        </button>
      </form>
    </div>
  </div>
</template>
