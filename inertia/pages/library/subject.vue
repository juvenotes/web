<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'

// Properly define types for component props
interface Article {
  pk_id: number | string
  article_id: number | string
  article_name: string
}

interface Props {
  articles: Article[]
  subjectName: string
}

const props = defineProps<Props>()

// Computed properties for better reactivity management
const hasArticles = computed(() => props.articles.length > 0)
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-12 header-animation">
        <!-- Back link -->
        <Link
          href="/library"
          class="inline-flex items-center text-sm text-gray-600 hover:text-[#55A9C4] transition-colors mb-6"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          All Subjects
        </Link>

        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {{ subjectName }}
        </h1>
        <div class="w-12 h-0.5 bg-[#55A9C4]"></div>
      </div>

      <!-- Article List -->
      <div v-if="hasArticles" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(article, index) in articles"
          :key="article.pk_id"
          class="article-card"
          :style="`--animation-order: ${index};`"
        >
          <a
            :href="`/library/article/${article.article_id}`"
            data-inertia="false"
            class="group block p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:border-[#55A9C4] rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-[#55A9C4]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 class="font-medium text-gray-900 group-hover:text-[#55A9C4] transition-colors">
                {{ article.article_name }}
              </h3>
            </div>
          </a>
        </div>
      </div>

      <!-- No Articles message -->
      <div v-else class="text-center py-16 empty-state">
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
        <p class="text-gray-600">There are no articles available for this subject yet.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-animation {
  animation: fadeIn 0.6s ease-out forwards;
}

.article-card {
  animation: fadeInUp 0.4s ease-out forwards;
  animation-delay: calc(var(--animation-order) * 0.05s);
  opacity: 0;
}

.empty-state {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>