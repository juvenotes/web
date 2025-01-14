<script setup lang="ts">
import AuthLayout from '~/layouts/AuthLayout.vue'
import { usePage } from '@inertiajs/vue3'

defineOptions({ layout: AuthLayout })

const { email } = usePage().props
</script>

<template>
  <AppHead title="Verify your email" description="You are almost there" />
  <div class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Verify your email</h1>

    <p class="mb-4">
      We've sent a verification link to <strong>{{ email }}</strong
      >. Please check your email and click the link to verify your account.
    </p>

    <p class="text-sm text-muted-foreground">
      If you don't see the email, check your spam folder. Need help? Contact support.
    </p>
  </div>
</template>
