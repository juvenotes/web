<template>
  <!-- Add a subtle background color to the whole page for better contrast -->
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto p-4 md:p-8">
      <!-- Header Section with Animation -->
      <div class="mb-8 md:mb-12 animate__animated animate__fadeInDown">
        <!-- Enhanced "Back" link - looks more like a button -->
        <Link
          href="/library"
          class="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-300 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          All Subjects
        </Link>

        <!-- A more visually appealing title with a gradient -->
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 pb-4 border-b"
        >
          {{ subjectName }}
        </h1>
      </div>

      <!-- Article List with Staggered Animation -->
      <div v-if="articles.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!--
            We use a v-for with an index to apply a staggered animation delay.
            Each card will appear slightly after the one before it.
          -->
        <div
          v-for="(article, index) in articles"
          :key="article.pk_id"
          class="animate__animated animate__fadeInUp"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <!-- The link is now a full card, which is more clickable and visually pleasing -->
          <a
            :href="`/library/article/${article.article_id}`"
            data-inertia="false"
            class="block bg-white rounded-lg shadow-md p-6 h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
          >
            <div class="flex items-start">
              <!-- Icon for visual flair -->
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                  {{ article.article_name }}
                </p>
                <!-- You could add a small description here later -->
                <!-- <p class="text-sm text-gray-500 mt-1">Short article description...</p> -->
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Enhanced "No Articles" message -->
      <div v-else class="text-center text-gray-500 mt-8 animate__animated animate__fadeIn">
        <div class="bg-white rounded-lg shadow-md p-10 max-w-lg mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 class="mt-4 text-xl font-semibold text-gray-700">No Articles Found</h3>
          <p class="mt-2 text-base">There are no articles available for this subject yet.</p>
          <p class="mt-1 text-base">Please check back later!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'

defineProps({
  articles: Array,
  subjectName: String,
})

// The script section remains the same, as the requested changes are purely presentational.
// The `a` tag with `data-inertia="false"` performs a full page reload, bypassing Inertia's SPA behavior.
</script>
