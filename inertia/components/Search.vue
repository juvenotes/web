<script setup lang="ts">
import { ref, watch } from 'vue'
import debounce from 'lodash/debounce'
import axios from 'axios'
import { Input } from '~/components/ui/input'

interface ConceptSearchResult {
  id: number
  title: string
  slug: string
  isTerminal: boolean
  level: number
}

const query = ref('')
const results = ref<ConceptSearchResult[]>([])
const isLoading = ref(false)

const search = debounce(async () => {
  if (!query.value || query.value.length < 2) {
    results.value = []
    return
  }

  try {
    isLoading.value = true
    const response = await axios.get<ConceptSearchResult[]>(`/api/concepts/search?q=${query.value}`)
    results.value = response.data
  } catch (error) {
    console.error('Search failed:', error)
    results.value = []
  } finally {
    isLoading.value = false
  }
}, 300)

watch(query, () => {
  search()
})
</script>

<template>
  <div class="relative w-full">
    <!-- Search Input -->
    <div class="relative">
      <Input
        v-model="query"
        type="search"
        placeholder="Search concepts..."
        class="w-full md:max-w-[300px] lg:max-w-[400px]"
        :class="{ 'opacity-50': isLoading }"
      />
      <div 
        v-if="isLoading" 
        class="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <div class="animate-spin h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full" />
      </div>
    </div>

    <!-- Results Dropdown -->
    <div
      v-if="query.length >= 2"
      class="absolute top-full mt-1 w-full md:max-w-[300px] lg:max-w-[400px] bg-white rounded-md border shadow-lg z-50"
    >
      <!-- Results List -->
      <div v-if="results.length > 0" class="max-h-[300px] overflow-y-auto p-2 space-y-1">
        <a
          v-for="result in results"
          :key="result.id"
          :href="`/concepts/${result.slug}`"
          class="block p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <span class="font-medium">{{ result.title }}</span>
        </a>
      </div>

      <!-- No Results Message -->
      <div v-else class="p-4 text-center text-muted-foreground text-sm">
        No concepts found. Try a different search term.
      </div>
    </div>

    <!-- Mobile Backdrop -->
    <div
      v-if="query.length >= 2"
      class="fixed inset-0 bg-black/20 z-40 md:hidden"
      @click="query = ''"
    />
  </div>
</template>
