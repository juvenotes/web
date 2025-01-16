<script setup lang="ts">
import { useForm, Link } from '@inertiajs/vue3'
import { Loader } from 'lucide-vue-next'
import AuthLayout from '~/layouts/AuthLayout.vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

defineOptions({ layout: AuthLayout })

const form = useForm({
  fullName: '',
  email: '',
  password: '',
})

const handleSubmit = () => {
  form.post('/register')
}
</script>

<template>
  <AppHead title="Register" description="Start your journey at Juvenotes" />
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Main Card -->
      <div class="bg-white rounded-lg shadow p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <img src="/public/images/logo.png" alt="Juvenotes" class="h-10 mx-auto mb-6" />
          <h1 class="text-xl font-medium mb-2">Create your account</h1>
          <p class="text-sm text-muted-foreground">
            Already have an account?
            <Link href="/login" class="text-primary hover:underline">Sign in</Link>
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Full Name -->
          <div class="space-y-1.5">
            <Label for="fullName">Full Name</Label>
            <Input
              id="fullName"
              v-model="form.fullName"
              type="text"
              required
              :class="{ 'border-destructive': form.errors.fullName }"
            />
            <p v-if="form.errors.fullName" class="text-sm text-destructive">
              {{ form.errors.fullName }}
            </p>
          </div>

          <!-- Email -->
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              required
              :class="{ 'border-destructive': form.errors.email }"
            />
            <p v-if="form.errors.email" class="text-sm text-destructive">
              {{ form.errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <Label for="password">Password</Label>
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

        

          <!-- Submit Button -->
          <Button
            type="submit"
            class="w-full bg-primary hover:bg-primary/90"
            :disabled="form.processing"
          >
            <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
            {{ form.processing ? 'Creating account...' : 'Create account' }}
          </Button>
          <div class="relative my-4">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>

    <Button 
  type="button" 
  class="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 
         border border-gray-300 rounded-lg shadow-sm transition-all duration-200 
         hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 
         focus:ring-[#4285F4]/50"
>
  <a 
    href="/auth/google/redirect"
    class="flex items-center justify-center gap-3"
  >
    <svg class="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
    <span class="text-sm">Continue with Google</span>
  </a>
</Button>
        </form>
      </div>
    </div>
  </div>
</template>