<script setup lang="ts">
import { useForm, Link } from '@inertiajs/vue3'
import { AlertCircle, Loader } from 'lucide-vue-next'
import AuthLayout from '~/layouts/AuthLayout.vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { Checkbox } from '~/components/ui/checkbox'

defineOptions({ layout: AuthLayout })

defineProps<{
    exceptions: Record<string, string>
}>()

const form = useForm({
    email: '',
    password: '',
    remember: false,
})
</script>

<template>
    <AppHead title="Login" description="Login to your Juvenotes account" />

    <div class="flex flex-col space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">Login</h1>
        <p class="text-sm text-muted-foreground">
            <Link href="/register">Need an account? Register</Link>
        </p>
    </div>

    <form @submit.prevent="form.post('/login')" class="grid gap-3">
        <Alert v-if="exceptions.E_INVALID_CREDENTIALS" variant="destructive" class="mb-6">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ exceptions.E_INVALID_CREDENTIALS }}</AlertDescription>
        </Alert>

        <div class="grid gap-1">
            <Label class="grid gap-1">
                <span>Email</span>
                <Input type="email" v-model="form.email" required />
            </Label>
            <div v-if="form.errors.email" class="text-red-500 text-sm">
                {{ form.errors.email }}
            </div>
        </div>

        <div class="grid gap-1">
            <Label class="grid gap-1">
                <span>Password</span>
                <Input type="password" v-model="form.password" required />
            </Label>
            <div v-if="form.errors.password" class="text-red-500 text-sm">
                {{ form.errors.password }}
            </div>
        </div>

        <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-2">
                <Checkbox v-model:checked="form.remember" />
                <span>Remember me</span>
            </div>
            <Link href="/forgot-password" class="text-sm underline">Forgot Password</Link>
        </div>

        <Button type="submit" :disabled="form.processing">
            <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
            Login
        </Button>
    </form>
</template>