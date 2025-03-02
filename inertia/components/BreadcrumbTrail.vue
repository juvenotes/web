<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { HomeIcon, ChevronRight, MoreHorizontal } from 'lucide-vue-next'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: any
}

const props = defineProps<{
  items: BreadcrumbItem[]
}>()

const allItems = computed(() => [{ label: 'Home', href: '/learn', icon: HomeIcon }, ...props.items])

// Simplified breadcrumb rendering - always show just first and last items with a dropdown
const visibleItems = computed(() => {
  const items = allItems.value

  return {
    firstItem: items[0],
    middleItems: items.length > 2 ? items.slice(1, -1) : [],
    lastItem: items[items.length - 1],
  }
})

// Check if we need a dropdown (more than 2 items)
const needsDropdown = computed(() => allItems.value.length > 2)
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex items-center text-sm text-muted-foreground">
    <ol class="flex items-center space-x-1 md:space-x-2">
      <!-- First Item (always visible) -->
      <li class="flex items-center">
        <Link
          v-if="visibleItems.firstItem.href"
          :href="visibleItems.firstItem.href"
          class="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          <component
            v-if="visibleItems.firstItem.icon"
            :is="visibleItems.firstItem.icon"
            class="h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{{ visibleItems.firstItem.label }}</span>
        </Link>
        <span v-else class="flex items-center gap-1">
          <component
            v-if="visibleItems.firstItem.icon"
            :is="visibleItems.firstItem.icon"
            class="h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{{ visibleItems.firstItem.label }}</span>
        </span>
      </li>

      <!-- Separator -->
      <li class="flex items-center" aria-hidden="true">
        <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/70" />
      </li>

      <!-- Middle Items Dropdown - Always use dropdown if there are middle items -->
      <template v-if="needsDropdown">
        <li class="relative">
          <DropdownMenu>
            <DropdownMenuTrigger
              class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted/50 transition-colors"
            >
              <span class="sr-only">Show more breadcrumb items</span>
              <MoreHorizontal class="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="min-w-[160px]">
              <template v-for="(item, idx) in visibleItems.middleItems" :key="`dropdown-${idx}`">
                <DropdownMenuItem v-if="item.href" asChild>
                  <Link :href="item.href" class="w-full cursor-pointer">
                    {{ item.label }}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem v-else>
                  {{ item.label }}
                </DropdownMenuItem>
              </template>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>

        <!-- Separator after dropdown -->
        <li class="flex items-center" aria-hidden="true">
          <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/70" />
        </li>
      </template>

      <!-- Last Item (always visible) -->
      <li class="flex items-center">
        <span class="truncate max-w-[120px] sm:max-w-none font-medium text-foreground">
          {{ visibleItems.lastItem.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
