<!-- filepath: /home/shikamaru/web/inertia/components/StudyTimeCard.vue -->
<template>
  <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Study Time</h3>
        <div class="mt-1 text-sm text-gray-500">Track your learning progress</div>
      </div>
      <div class="rounded-lg bg-[#55A9C4]/20 p-2 flex items-center justify-center">
        <Clock class="h-5 w-5 text-[#55A9C4]" />
      </div>
    </div>

    <div v-if="loading" class="mt-6 py-8 flex justify-center">
      <span class="animate-pulse">Loading study data...</span>
    </div>
    
    <div v-else class="mt-5">
      <!-- Today's stats -->
      <div class="mb-5">
        <div class="text-sm font-medium text-gray-500">Today</div>
        <div class="mt-1 text-2xl font-bold text-[#2C5D6F]">{{ stats.today.formatted }}</div>
        
        <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div v-if="stats.today.activities.concepts > 0" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>{{ stats.today.activities.concepts }} concepts</span>
          </div>
          <div v-if="stats.today.activities.mcqs > 0" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{{ stats.today.activities.mcqs }} MCQs</span>
          </div>
          <div v-if="stats.today.activities.saqs > 0" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>{{ stats.today.activities.saqs }} SAQs</span>
          </div>
          <div v-if="stats.today.activities.osces > 0" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>{{ stats.today.activities.osces }} OSCEs</span>
          </div>
          <div v-if="stats.today.activities.spots > 0" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-pink-500"></div>
            <span>{{ stats.today.activities.spots }} SPOTs</span>
          </div>
          <div v-if="stats.today.activities.papers > 0" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-gray-500"></div>
            <span>{{ stats.today.activities.papers }} papers</span>
          </div>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="h-px bg-gray-200 my-4"></div>
      
      <!-- Total stats -->
      <div>
        <div class="text-sm font-medium text-gray-500">Total Study Time</div>
        <div class="mt-1 text-2xl font-bold text-[#2C5D6F]">{{ stats.formattedTotal }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Clock } from 'lucide-vue-next'
import axios from 'axios'

const stats = ref({
  totalSeconds: 0,
  formattedTotal: '0m',
  today: {
    seconds: 0,
    formatted: '0m',
    activities: {
      concepts: 0,
      mcqs: 0,
      saqs: 0,
      osces: 0,
      spots: 0,
      papers: 0
    }
  }
})

const loading = ref(true)

onMounted(async () => {
  try {
    const response = await axios.get('/api/user/study-time')
    stats.value = response.data
  } catch (error) {
    console.error('Failed to fetch study time stats:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(85, 169, 196, 0.3);
  border-radius: 50%;
  border-top-color: #55A9C4;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>