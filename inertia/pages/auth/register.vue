<script setup lang="ts">
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
</template>