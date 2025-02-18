<script setup lang="ts">
import { TrainingLevel, TrainingLevelLabels } from '#enums/training_level'

const props = defineProps<{
  modelValue: TrainingLevel | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TrainingLevel | null]
}>()

const options = [
  { value: null, label: 'All' },
  { value: TrainingLevel.PRECLINICAL, label: TrainingLevelLabels[TrainingLevel.PRECLINICAL] },
  { value: TrainingLevel.CLINICAL, label: TrainingLevelLabels[TrainingLevel.CLINICAL] },
]
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
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>