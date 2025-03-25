<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import UserDto from '#dtos/user'
import AppLayout from '~/layouts/AppLayout.vue'
import { Settings, ArrowLeft, Laptop, MapPin, Clock, Info } from 'lucide-vue-next'
import SessionLogDto from '#dtos/session_log'

defineOptions({ layout: AppLayout })

defineProps<{ user: UserDto; sessions: SessionLogDto[] }>()

// Email update form
const emailForm = useForm({
  email: '',
  password: '',
})

// Session termination forms
const terminateForm = useForm({})

// Form handlers
const updateEmail = () => {
  emailForm.put('/settings/account/email', {
    onSuccess: () => emailForm.reset(),
  })
}

const terminateSession = (id: number) => {
  if (confirm('Are you sure you want to terminate this session?')) {
    terminateForm.delete(`/sessions/${id}`)
  }
}

const terminateAllOtherSessions = () => {
  if (confirm('Are you sure you want to terminate all other sessions?')) {
    terminateForm.delete('/sessions')
  }
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

    <!-- Active Sessions Section -->
    <div class="bg-white p-6 rounded-lg border space-y-4">
      <div>
        <h2 class="text-lg font-medium">Active Sessions</h2>
        <p class="text-sm text-muted-foreground">
          Below are the active sessions for your account. Active sessions are sessions that haven't
          signed out or expired. Location information is provided by IP2Location and is based on the
          IP Address of the session, accuracy will vary depending on the ISP/VPN.
        </p>
      </div>

      <div class="mt-4 space-y-4">
        <div v-if="sessions.length" class="space-y-4">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="bg-white border rounded-md overflow-hidden"
          >
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <Laptop class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">
                    {{ session.browserName }} {{ session.browserVersion }}
                  </span>
                  <span
                    v-if="session.isCurrentSession"
                    class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                  >
                    Current Session
                  </span>
                </div>
                <button
                  v-if="!session.isCurrentSession"
                  @click="terminateSession(session.id)"
                  class="text-red-600 text-sm hover:text-red-800"
                >
                  Terminate
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div class="flex items-center space-x-2">
                  <MapPin class="h-4 w-4 text-muted-foreground" />
                  <span>
                    {{
                      [session.city, session.country].filter(Boolean).join(', ') ||
                      'Unknown location'
                    }}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <span>Last active {{ session.lastTouchedAgo }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Info class="h-4 w-4 text-muted-foreground" />
                  <span class="text-muted-foreground">IP: {{ session.ipAddress }}</span>
                </div>
                <div
                  v-if="session.latitude && session.longitude"
                  class="flex items-center space-x-2"
                >
                  <MapPin class="h-4 w-4 text-muted-foreground" />
                  <span class="text-muted-foreground">
                    {{ session.latitude.toFixed(2) }}, {{ session.longitude.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
          <p class="text-muted-foreground">No active sessions found</p>
        </div>

        <div v-if="sessions.length > 1" class="mt-4">
          <button
            @click="terminateAllOtherSessions"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Terminate All Other Sessions
          </button>
        </div>

        <!-- Attribution -->
        <div class="text-xs text-gray-500 mt-4 pt-4 border-t">
          <p>
            IP geolocation data provided by
            <a
              href="https://www.ip2location.com"
              class="text-primary hover:underline"
              target="_blank"
              >IP2Location</a
            >.
          </p>
        </div>
      </div>
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
