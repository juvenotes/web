<script setup lang="ts">
import { computed } from 'vue'
import { usePage, Link } from '@inertiajs/vue3'
import { Eye } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

const page = usePage()
const isAdmin = computed(() => page.url.includes('/manage'))

const toggleUrl = computed(() => {
  const url = page.url
  return url.replace('/manage/', '/')
})
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          v-if="isAdmin"
          :href="toggleUrl"
          class="inline-flex h-9 items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary border border-primary/10 w-full sm:w-auto"
        >
          <Eye class="h-4 w-4" />
          <span class="text-sm font-medium">View</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <span>Switch to user view</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
