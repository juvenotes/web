<script setup lang="ts">
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { Eye, Settings } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const page = usePage()
const isAdmin = computed(() => page.url.includes('/manage'))
const toggleUrl = computed(() => 
  isAdmin.value 
    ? page.url.replace('/manage', '') 
    : `/manage${page.url}`
)
</script>

<template>
  <Button 
    variant="outline" 
    size="sm"
    :href="toggleUrl"
    class="gap-2"
  >
    <component :is="isAdmin ? Eye : Settings" class="h-4 w-4" />
    <span class="hidden sm:inline">{{ isAdmin ? 'View Mode' : 'Edit Mode' }}</span>
  </Button>
</template>