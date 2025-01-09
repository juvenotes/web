<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import type UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.png'
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center">
          <Link href="/">
            <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
          </Link>
        </div>
        
        <div class="flex items-center gap-4">
          <template v-if="user">
            <span class="text-sm text-muted-foreground">
                Welcome, {{ user.fullName || user.email }}
            </span>
            <Button variant="ghost" @click="() => $inertia.post('/logout')">
              Logout
            </Button>
          </template>
          <template v-else>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Messages -->
    <div v-if="messages.success" class="container mx-auto px-4 mt-4">
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        {{ messages.success }}
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>