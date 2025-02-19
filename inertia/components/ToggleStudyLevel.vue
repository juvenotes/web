<script setup lang="ts">
import PastPaperDto from '#dtos/past_paper'
import { StudyLevel, StudyLevelLabels } from '#enums/study_level'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: StudyLevel | null
  papers: PastPaperDto[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StudyLevel | null]
}>()

const availableLevels = computed(() => {
  const levels = new Set(props.papers.map((paper) => paper.studyLevel).filter(Boolean))
  return Array.from(levels) as StudyLevel[]
})

const options = computed(() => [
  { value: null, label: 'All Levels' },
  ...availableLevels.value.map((value) => ({
    value: value as StudyLevel,
    label: StudyLevelLabels[value as StudyLevel],
  })),
])
</script>

<template>
  <div class="flex items-center gap-2 p-1 bg-muted rounded-lg">
    <button
      v-for="option in options"
      :key="option.value ?? 'all'"
      class="px-3 py-1.5 text-sm rounded-md transition-colors"
      :class="[
        modelValue === option.value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
