<script setup>
import { ref } from 'vue'
import axios from 'axios'

const phone = ref('')
const amount = ref('')
const loading = ref(false)
const result = ref(null)
const errorDetails = ref(null)
const rawResponse = ref(null) // To capture raw response for debugging

async function handleSubmit() {
  loading.value = true
  errorDetails.value = null
  rawResponse.value = null
  
  try {
    const response = await axios.post('/api/payments/mpesa/process', {
      phone: phone.value,
      amount: parseFloat(amount.value)
    })
    
    // Axios automatically parses JSON responses
    result.value = response.data
    
  } catch (error) {
    console.error('Payment API error:', error)
    
    // Capture detailed error information
    errorDetails.value = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      apiMessage: error.response?.data?.message || error.response?.data?.error || 'Unknown API error',
      details: error.response?.data || {},
      type: error.name,
      message: error.message
    }
    
    // If there was a response but parsing failed, capture the raw data
    if (error.response && typeof error.response.data === 'string') {
      try {
        rawResponse.value = error.response.data.substring(0, 500) // First 500 chars
      } catch (e) {
        rawResponse.value = 'Could not extract raw response'
      }
    }
    
    result.value = { error: `Failed to process payment: ${errorDetails.value.message}` }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">M-Pesa Payment Test</h1>
    
    <form @submit.prevent="handleSubmit" class="mb-6 space-y-4 max-w-md">
      <div>
        <label for="phone" class="block font-medium mb-1">Phone Number</label>
        <input
          type="text"
          id="phone"
          v-model="phone"
          placeholder="2547XXXXXXXX"
          class="w-full px-3 py-2 border rounded"
          required
        />
        <p class="text-sm text-gray-500 mt-1">Format: 2547XXXXXXXX (without +)</p>
      </div>
      
      <div>
        <label for="amount" class="block font-medium mb-1">Amount</label>
        <input
          type="number"
          id="amount"
          v-model="amount"
          placeholder="Amount in KES"
          class="w-full px-3 py-2 border rounded"
          min="1"
          required
        />
      </div>
      
      <button 
        type="submit" 
        class="bg-blue-600 text-white px-4 py-2 rounded"
        :disabled="loading"
      >
        {{ loading ? 'Processing...' : 'Pay with M-Pesa' }}
      </button>
    </form>
    
    <div v-if="result" class="mt-6">
      <h2 class="text-xl font-medium mb-2">
        {{ result.error ? 'Error' : 'Success' }}
      </h2>
      
      <!-- Enhanced error details section -->
      <div v-if="errorDetails" class="mb-4 p-3 border border-red-200 bg-red-50 rounded">
        <p class="font-medium text-red-700">Error Details:</p>
        <ul class="mt-2 text-sm text-red-600 list-disc list-inside">
          <li v-if="errorDetails.status">HTTP Status: {{ errorDetails.status }} ({{ errorDetails.statusText }})</li>
          <li v-if="errorDetails.apiMessage">Message: {{ errorDetails.apiMessage }}</li>
          <li v-if="errorDetails.type">Error Type: {{ errorDetails.type }}</li>
          <li v-if="errorDetails.message">Error Message: {{ errorDetails.message }}</li>
        </ul>
        
        <!-- Raw response data for debugging -->
        <div v-if="rawResponse" class="mt-3">
          <p class="font-medium text-red-700">Raw Response Preview:</p>
          <pre class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs overflow-auto">{{ rawResponse }}</pre>
        </div>
      </div>
      
      <pre class="bg-gray-100 p-4 rounded overflow-auto max-w-2xl">
        {{ JSON.stringify(result, null, 2) }}
      </pre>
    </div>
  </div>
</template>