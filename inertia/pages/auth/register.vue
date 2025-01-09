<!-- <script setup lang="ts">
import AuthLayout from '~/layouts/AuthLayout.vue'
import { useForm, Link } from '@inertiajs/vue3'
import { Loader } from 'lucide-vue-next'
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
  form.post('/register', {
    onSuccess: () => {
      console.log('Registration successful')
    },
    onError: (errors) => {
      console.log('Registration errors:', errors)
    }
  })
}
</script>

<template>
  <AppHead title="Register" description="Join Juvenotes" />

  <div class="flex flex-col space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">Register</h1>
    <p class="text-sm text-muted-foreground">
      <Link href="/login">Have an account? Login</Link>
    </p>
  </div>

  <form class="grid gap-3" @submit.prevent="handleSubmit">
    <div class="grid gap-1">
      <Label class="grid gap-1">
        <span>Full Name</span>
        <Input 
          type="text"
          v-model="form.fullName"
          required
        />
      </Label>
      <div v-if="form.errors.fullName" class="text-red-500 text-sm">
        {{ form.errors.fullName }}
      </div>
    </div>

    <div class="grid gap-1">
      <Label class="grid gap-1">
        <span>Email</span>
        <Input 
          type="email"
          v-model="form.email"
          required 
        />
      </Label>
      <div v-if="form.errors.email" class="text-red-500 text-sm">
        {{ form.errors.email }}
      </div>
    </div>

    <div class="grid gap-1">
      <Label class="grid gap-1">
        <span>Password</span>
        <Input 
          type="password"
          v-model="form.password"
          required
        />
      </Label>
      <div v-if="form.errors.password" class="text-red-500 text-sm">
        {{ form.errors.password }}
      </div>
    </div>

    <Button type="submit" :disabled="form.processing">
      <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
      Register
    </Button>
  </form>
</template> -->

<script setup lang="ts">
import { useForm, Link } from '@inertiajs/vue3'
import { AlertCircle, Loader } from 'lucide-vue-next'
import AuthLayout from '~/layouts/AuthLayout.vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'

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
        </form>
      </div>
    </div>
  </div>
</template>