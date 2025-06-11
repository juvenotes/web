<script setup lang="ts">
import { ref } from 'vue'
import type { RawArticleRow } from '../../../app/types/medical_article'

const props = defineProps<{ subjectMap: Record<string, RawArticleRow[]> }>()

const openSubjects = ref<Record<string, boolean>>({})

function toggleSubject(subject: string) {
  openSubjects.value = {
    ...openSubjects.value,
    [subject]: !openSubjects.value[subject],
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(articles, subject) in props.subjectMap"
        :key="subject"
        class="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-[#55A9C4]/20 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
      >
        <button
          class="w-full text-left px-6 py-6 font-semibold text-xl flex justify-between items-center bg-transparent focus:outline-none"
          @click="toggleSubject(subject)"
        >
          <span class="truncate">{{ subject }}</span>
          <span class="text-[#55A9C4] text-lg">{{ openSubjects[subject] ? '▲' : '▼' }}</span>
        </button>
        <transition name="fade">
          <div v-if="openSubjects[subject]" class="px-6 pb-6 pt-2">
            <ul class="space-y-2">
              <li v-for="article in articles" :key="article.pk_id">
                <a
                  :href="`/library/${article.article_id}`"
                  class="hover:underline text-[#55A9C4] font-medium"
                >
                  {{ article.article_name }}
                </a>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
