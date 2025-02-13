<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { HomeIcon, ChevronRight } from 'lucide-vue-next'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: any
}

const props = defineProps<{
  items: BreadcrumbItem[]
}>()

const breadcrumbItems = computed(() => {
  return [{ label: 'Home', href: '/learn', icon: HomeIcon }, ...props.items]
})
</script>

<template>
  <nav aria-label="breadcrumb" class="min-h-[32px] w-full overflow-x-auto">
    <ol class="flex items-center flex-nowrap min-w-full px-1 sm:px-0">
      <li
        v-for="(item, index) in breadcrumbItems"
        :key="index"
        class="flex items-center flex-shrink-0 last:flex-shrink"
      >
        <div class="flex items-center">
          <Link
            v-if="item.href && index !== breadcrumbItems.length - 1"
            :href="item.href"
            class="inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors whitespace-nowrap"
          >
            <component
              v-if="item.icon"
              :is="item.icon"
              class="h-4 w-4 flex-shrink-0 hidden sm:block"
              aria-hidden="true"
            />
            <span class="truncate max-w-[100px] sm:max-w-[200px]">{{ item.label }}</span>
          </Link>

          <span v-else class="text-sm text-muted-foreground">
            <div class="inline-flex items-center gap-1.5">
              <component
                v-if="item.icon"
                :is="item.icon"
                class="h-4 w-4 flex-shrink-0 hidden sm:block"
                aria-hidden="true"
              />
              <span class="truncate max-w-[100px] sm:max-w-none">{{ item.label }}</span>
            </div>
          </span>

          <ChevronRight
            v-if="index !== breadcrumbItems.length - 1"
            class="h-4 w-4 mx-2 text-muted-foreground/50 flex-shrink-0"
            aria-hidden="true"
          />
        </div>
      </li>
    </ol>
  </nav>
</template>
