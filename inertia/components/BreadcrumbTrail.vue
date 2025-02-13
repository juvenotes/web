<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { HomeIcon } from 'lucide-vue-next'

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
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <BreadcrumbItem>
          <template v-if="item.href && index !== breadcrumbItems.length - 1">
            <Link
              :href="item.href"
              class="inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
            >
              <component
                v-if="item.icon"
                :is="item.icon"
                class="h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span class="truncate max-w-[100px] sm:max-w-[200px]">{{ item.label }}</span>
            </Link>
          </template>
          <BreadcrumbPage v-else>
            <div class="inline-flex items-center gap-1.5">
              <component
                v-if="item.icon"
                :is="item.icon"
                class="h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span class="truncate max-w-[100px] sm:max-w-[200px]">{{ item.label }}</span>
            </div>
          </BreadcrumbPage>
        </BreadcrumbItem>

        <BreadcrumbSeparator
          v-if="index !== breadcrumbItems.length - 1"
          class="text-muted-foreground/50"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
