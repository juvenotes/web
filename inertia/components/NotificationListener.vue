<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Transmit } from '@adonisjs/transmit-client'

const props = defineProps<{ userId: number | null | undefined }>()
const feedbackBanner = ref<{ message: string, question: any } | null>(null)
let subscription: any = null
let transmit: Transmit | null = null

onMounted(async () => {
  if (!props.userId) return
  transmit = new Transmit({ baseUrl: window.location.origin })
  subscription = transmit.subscription(`users/${props.userId}`)
  await subscription.create()
  subscription.onMessage((data: any) => {
    if (data.type === 'feedback_resolved') {
      feedbackBanner.value = {
        message: data.message,
        question: data.question,
      }
      setTimeout(() => { feedbackBanner.value = null }, 6000)
    }
  })
})

onUnmounted(() => {
  if (subscription) subscription.delete()
})
</script>

<template>
  <div v-if="feedbackBanner"
    class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded shadow-lg flex items-center z-50">
    <span>{{ feedbackBanner.message }}</span>
    <button class="ml-4 text-green-700 hover:text-green-900" @click="feedbackBanner = null">&times;</button>
  </div>
</template>
