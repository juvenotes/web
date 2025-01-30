<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { Info, Loader } from 'lucide-vue-next'
import AuthLayout from '~/layouts/AuthLayout.vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'

defineOptions({ layout: AuthLayout })
const props = defineProps<{ value: string; isValid: boolean; email: string | null }>()

const form = useForm({
  value: props.value,
  // email: props.email,
  password: '',
})
</script>

<template>
  <AppHead title="Reset Your Password?" description="Reset your Juvenotes password" />

  <div class="flex flex-col space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">Reset Your Password?</h1>
    <p class="text-sm text-muted-foreground">Please enter your desired new password below</p>
  </div>

  <div v-if="!isValid">
    <Alert>
      <Info class="w-4 h-4" />
      <AlertTitle>Password Reset Link Invalid</AlertTitle>
      <AlertDescription>
        This password reset link is invalid or has expired. Please try again.
      </AlertDescription>
    </Alert>

    <Button as-child class="mt-3 flex">
      <Link href="/forgot-password">Request New Password Reset Link</Link>
    </Button>
  </div>

  <form
    v-else
    @submit.prevent="
      form.post('/forgot-password/reset', { onSuccess: () => form.reset(), preserveScroll: true })
    "
  >
    <div class="grid gap-3">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          :model-value="email ?? ''"
          type="email"
          disabled
        />
        <!-- :class="{ 'border-destructive': form.errors.email } -->
        <!-- <p v-if="form.errors.email" class="text-sm text-destructive">
          {{ form.errors.email }}
        </p> -->
      </div>

      <div class="space-y-2">
        <Label for="password">New Password</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          required
          :class="{ 'border-destructive': form.errors.password }"
        />
        <p v-if="form.errors.password" class="text-sm text-destructive">
          {{ form.errors.password }}
        </p>
      </div>

      <Button type="submit" :disabled="form.processing">
        <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
        Reset Password
      </Button>
    </div>
  </form>
</template>
