<script setup lang="ts">
import AuthLayout from '~/layouts/AuthLayout.vue'
import { usePage, router } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import { ref } from 'vue'
import { Loader } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'

defineOptions({ layout: AuthLayout })

const { email } = usePage().props
const isResending = ref(false)
const cooldown = ref(0)

const resendEmail = async () => {
  if (cooldown.value > 0 || isResending.value) return

  isResending.value = true
  await router.post('/auth/resend-email')
  isResending.value = false

  cooldown.value = 60
  const timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
</script>

<template>
  <AppHead title="Verify your email" description="You are almost there" />
  <div class="max-w-md mx-auto p-6 space-y-8">
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">Verify your email</h1>

      <p class="text-base text-muted-foreground">
        We've sent a verification link to <strong class="text-foreground">{{ email }}</strong
        >. Please check your email and click the link to verify your account.
      </p>

      <p class="text-sm text-muted-foreground">
        If you don't see the email, check your spam folder.
      </p>
    </div>

    <div class="space-y-4">
      <Button class="w-full" @click="resendEmail" :disabled="cooldown > 0 || isResending">
        <Loader v-if="isResending" class="mr-2 h-4 w-4 animate-spin" />
        {{ cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email' }}
      </Button>

      <p class="text-sm text-center text-muted-foreground">
        Need help?
        <Link href="mailto:support@juvenotes.com" class="text-primary hover:underline"
          >Contact support</Link
        >
      </p>
    </div>
  </div>
</template>
