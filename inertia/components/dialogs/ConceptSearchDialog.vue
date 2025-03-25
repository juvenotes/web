<script setup lang="ts">
import { ref, watch } from 'vue'
import debounce from 'lodash/debounce'
import axios from 'axios'
import { Search, X, Plus, Check } from 'lucide-vue-next'

interface ConceptSearchResult {
  id: number
  title: string
  slug: string
  isTerminal: boolean
  level: number
}

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Select Related Concept',
  },
  buttonVariant: {
    type: String,
    default: 'outline',
  },
  selectedConcepts: {
    type: Array as () => ConceptSearchResult[],
    default: () => [],
  },
  // Single selection mode or multiple selection
  multiSelect: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: 'Search for concepts...',
  },
  // Compact mode for tighter layouts
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'remove'])

const isOpen = ref(false)
const query = ref('')
const results = ref<ConceptSearchResult[]>([])
const isLoading = ref(false)
const selected = ref<ConceptSearchResult[]>(props.selectedConcepts || [])

// Always use the public API endpoint for now
const searchEndpoint = '/api/concepts/search'

const search = debounce(async () => {
  if (!query.value || query.value.length < 2) {
    results.value = []
    return
  }

  try {
    isLoading.value = true
    const response = await axios.get<ConceptSearchResult[]>(
      `${searchEndpoint}?q=${encodeURIComponent(query.value)}`
    )
    results.value = response.data
  } catch (error) {
    console.error('Search failed:', error)
    results.value = []
  } finally {
    isLoading.value = false
  }
}, 300)

function selectConcept(concept: ConceptSearchResult) {
  if (props.multiSelect) {
    // Don't add duplicates
    if (!selected.value.some((c) => c.id === concept.id)) {
      selected.value.push(concept)
      emit('select', [...selected.value])
    }
  } else {
    // Single selection mode
    selected.value = [concept]
    emit('select', concept)
  }

  isOpen.value = false
  query.value = ''
}

function removeConcept(concept: ConceptSearchResult) {
  selected.value = selected.value.filter((c) => c.id !== concept.id)
  emit('remove', concept)
  emit('select', props.multiSelect ? [...selected.value] : null)
}

watch(query, () => {
  search()
})

watch(
  () => props.selectedConcepts,
  (newValue) => {
    selected.value = Array.isArray(newValue) ? newValue : newValue ? [newValue] : []
  },
  { deep: true }
)
</script>

<template>
  <div>
    <!-- Display selected concepts if they exist -->
    <div v-if="selected.length" class="flex flex-wrap gap-2 mb-3" :class="{ 'mb-2': compact }">
      <div
        v-for="concept in selected"
        :key="concept.id"
        class="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md"
        :class="{ 'text-sm': compact }"
      >
        <a :href="`/concepts/${concept.slug}`" class="font-medium hover:underline" target="_blank">
          {{ concept.title }}
        </a>
        <button
          type="button"
          class="text-primary/70 hover:text-primary ml-1"
          @click="removeConcept(concept)"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <Dialog v-model:open="isOpen">
      <DialogTrigger asChild>
        <Button :variant="buttonVariant" class="gap-2" :size="compact ? 'sm' : 'default'">
          <Plus v-if="multiSelect" class="h-4 w-4" />
          <Search v-else class="h-4 w-4" />
          {{ buttonText }}
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{{ multiSelect ? 'Select Concepts' : 'Search for a Concept' }}</DialogTitle>
        </DialogHeader>

        <div class="mt-4">
          <!-- Search Input -->
          <div class="relative">
            <Input
              v-model="query"
              type="search"
              :placeholder="placeholder"
              class="w-full pr-8"
              autofocus
            />
            <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
              <div
                class="animate-spin h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full"
              />
            </div>
          </div>

          <!-- Results -->
          <div
            class="mt-2 max-h-[300px] overflow-y-auto border rounded-md"
            v-if="query.length >= 2"
          >
            <div v-if="results.length > 0" class="p-1">
              <button
                v-for="result in results"
                :key="result.id"
                @click="selectConcept(result)"
                class="w-full text-left p-3 hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                :class="{
                  'opacity-50 pointer-events-none': selected.some((c) => c.id === result.id),
                }"
              >
                <div class="flex-1">
                  <div class="font-medium">{{ result.title }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ result.isTerminal ? 'Terminal concept' : 'Parent concept' }}
                  </div>
                </div>
                <div v-if="selected.some((c) => c.id === result.id)" class="text-primary">
                  <Check class="h-4 w-4" />
                </div>
              </button>
            </div>

            <div v-else class="p-4 text-center text-muted-foreground text-sm">
              No concepts found. Try a different search term.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
