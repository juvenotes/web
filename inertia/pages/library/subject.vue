<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'

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

const hasArticles = computed(() => props.articles.length > 0)
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="container-default py-6 sm:py-8 px-4 sm:px-6">
      <!-- Header Section -->
      <div class="mb-6 sm:mb-10 header-animation">
        <!-- Back link -->
        <Link
          href="/library"
          class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#55A9C4] transition-colors duration-200 mb-4 sm:mb-5 group"
        >
          <svg 
            class="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to all subjects
        </Link>

        <!-- Title -->
        <div class="mb-5 sm:mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {{ subjectName }}
          </h1>
          <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
        </div>
      </div>

      <!-- Article List - Responsive grid -->
      <div v-if="hasArticles" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <div
          v-for="(article, index) in articles"
          :key="article.pk_id"
          class="article-card"
          :style="`--animation-order: ${index};`"
        >
          <a
            :href="`/library/article/${article.article_id}`"
            data-inertia="false"
            class="group block p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-[#55A9C4]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 mt-0.5">
                <div class="h-8 w-8 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
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
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-200 line-clamp-2">
                  {{ article.article_name }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">Read article</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- No Articles message -->
      <div v-else class="text-center py-12 sm:py-16 empty-state">
        <div class="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-5">
          <svg
            class="h-8 w-8 sm:h-10 sm:w-10 text-gray-400"
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
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
        <p class="text-sm sm:text-base text-gray-500 max-w-md mx-auto">We couldn't find any articles for this subject. Check back later or explore other subjects.</p>
        <Link
          href="/library"
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#55A9C4] hover:bg-[#4795af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#55A9C4] transition-colors duration-200"
        >
          Browse all subjects
        </Link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-animation {
  animation: fadeIn 0.5s ease-out forwards;
}

.article-card {
  animation: fadeInUp 0.4s ease-out forwards;
  animation-delay: calc(var(--animation-order) * 0.05s);
  opacity: 0;
  will-change: transform, opacity;
}

.empty-state {
  animation: fadeIn 0.6s ease-out forwards;
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
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Improved touch targets */
@media (max-width: 640px) {
  a.group {
    min-height: 56px;
  }
  
  .container-default {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>