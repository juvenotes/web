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
    <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <!-- Card Container -->
            <div class="bg-card rounded-xl shadow-lg p-8 space-y-6">
                <!-- Header -->
                <div class="text-center space-y-2">
                    <img src="/public/images/logo.png" alt="Juvenotes" class="h-12 mx-auto mb-4" />
                    <h1 class="text-2xl font-semibold">Welcome back</h1>
                    <p class="text-sm text-muted-foreground">
                        New to Juvenotes? 
                        <Link href="/register" class="text-primary hover:underline transition-all">
                            Create an account
                        </Link>
                    </p>
                </div>

                <!-- Alert -->
                <Alert v-if="exceptions?.E_INVALID_CREDENTIALS" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ exceptions.E_INVALID_CREDENTIALS }}</AlertDescription>
                </Alert>

                <!-- Form -->
                <form @submit.prevent="form.post('/login')" class="space-y-4">
                    <div class="space-y-4">
                        <!-- Email -->
                        <div class="space-y-2">
                            <Label for="email">Email</Label>
                            <Input
                                id="email"
                                v-model="form.email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                :class="{ 'border-destructive': form.errors.email }"
                            />
                            <p v-if="form.errors.email" class="text-sm text-destructive">
                                {{ form.errors.email }}
                            </p>
                        </div>

                        <!-- Password -->
                        <div class="space-y-2">
                            <Label for="password">Password</Label>
                            <Input
                                id="password"
                                v-model="form.password"
                                type="password"
                                required
                                placeholder="••••••••"
                                :class="{ 'border-destructive': form.errors.password }"
                            />
                            <p v-if="form.errors.password" class="text-sm text-destructive">
                                {{ form.errors.password }}
                            </p>
                        </div>
                    </div>

                    <!-- Remember & Forgot -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <Checkbox id="remember" v-model="form.remember" />
                            <Label for="remember" class="text-sm">Remember me</Label>
                        </div>
                        <Link 
                            href="/forgot-password"
                            class="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <!-- Submit Button -->
                    <Button
                        type="submit"
                        class="w-full"
                        size="lg"
                        :disabled="form.processing"
                    >
                        <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
                        {{ form.processing ? 'Signing in...' : 'Sign in' }}
                    </Button>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bg-card {
    background: linear-gradient(to bottom right, rgb(255, 255, 255), rgb(251, 251, 251));
}
</style>