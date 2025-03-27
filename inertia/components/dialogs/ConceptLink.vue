<script setup lang="ts">
interface ConceptProps {
  id: number
  title: string
  slug: string
}

defineProps<{
  concept: ConceptProps
  variant?: 'default' | 'compact' | 'button'
}>()
</script>

<template>
  <div>
    <!-- Default style - for most cases -->
    <a
      v-if="variant === 'default' || !variant"
      :href="`/concepts/${concept.slug}`"
      class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/15 transition-colors"
    >
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
        ></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
      <span class="font-medium">{{ concept.title }}</span>
    </a>

    <!-- Compact style - for tight spaces -->
    <a
      v-else-if="variant === 'compact'"
      :href="`/concepts/${concept.slug}`"
      class="inline-flex items-center gap-1 px-2 py-1 bg-primary/5 text-primary rounded-md hover:bg-primary/10 transition-colors text-sm"
    >
      <span>{{ concept.title }}</span>
    </a>

    <!-- Button style - for CTAs -->
    <a
      v-else-if="variant === 'button'"
      :href="`/concepts/${concept.slug}`"
      class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
    >
      <span>Learn about {{ concept.title }}</span>
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
      </svg>
    </a>
  </div>
</template>
