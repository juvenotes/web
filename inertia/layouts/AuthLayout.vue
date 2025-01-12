<script setup lang="ts">
defineProps<{
    messages: Record<string, string | Record<string, string>>
}>()

const logoPath = '/images/logo.png'
</script>

<template>
    <div>
        <header>
            <nav class="flex items-center justify-between p-6 lg:px-8">
                <div class="flex lg:flex-1">
                    <Link href="/" class="-m-1.5 p-1.5">
                    <span class="sr-only">Juvenotes</span>
                    <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
                    </Link>
                </div>
                <div class="flex flex-1 justify-end gap-4">
                    <Link href="/register" class="text-sm font-semibold leading-6 text-slate-900">
                    Register
                    </Link>
                    <Link href="/login" class="text-sm font-semibold leading-6 text-slate-900"> Login </Link>
                </div>
            </nav>
        </header>
        <div class="p-6 lg:p-8">
            <div class="flex flex-col justify-center space-y-6 w-full sm:w-[350px] mx-auto">
                <slot />
            </div>
        </div>

        <ToastManager :messages="messages" />
    </div>
</template>