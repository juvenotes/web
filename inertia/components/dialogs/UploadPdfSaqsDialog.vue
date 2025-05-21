<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Upload, Loader2, AlertTriangle } from 'lucide-vue-next'
import { ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const file = ref<File | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const saqData = ref<any>(null)
const isDesktop = ref(true)
const progressMessage = ref<string>('')

// Use environment variable for FastAPI websocket endpoint for SAQ
const FASTAPI_WS_SAQ_URL = import.meta.env.VITE_FASTAPI_WS_SAQ_URL || 'ws://localhost:8008/ws-saq-upload'

onMounted(() => {
  isDesktop.value = window.innerWidth > 768
})

function resetDialog() {
  file.value = null
  isLoading.value = false
  error.value = null
  saqData.value = null
  progressMessage.value = ''
}

function showProgressToast(msg: string) {
  progressMessage.value = msg
  toast(msg, { duration: 2500 })
}

watch(
  () => props.open,
  (open) => {
    if (!open) resetDialog()
  }
)

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    const selected = input.files[0]
    if (selected.type !== 'application/pdf') {
      error.value = 'Please select a PDF file.'
      file.value = null
      return
    }
    file.value = selected
    error.value = null
  }
}

async function handleUpload() {
  if (!file.value) {
    error.value = 'Please select a PDF file.'
    return
  }
  isLoading.value = true
  error.value = null
  saqData.value = null
  progressMessage.value = ''
  try {
    const ws = new WebSocket(FASTAPI_WS_SAQ_URL)
    ws.binaryType = 'arraybuffer'
    ws.onopen = () => {
      const reader = new FileReader()
      reader.onload = () => {
        ws.send(reader.result as ArrayBuffer)
      }
      reader.readAsArrayBuffer(file.value!)
    }
    ws.onerror = (e) => {
      error.value = 'WebSocket connection failed.'
      isLoading.value = false
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        saqData.value = data
        if (data.progress !== undefined) {
          isLoading.value = true
          error.value = null
        }
        if (data.message) {
          showProgressToast(data.message)
        }
        // Only close the websocket if the server indicates parsing is done
        if (data.done || data.finished || (data.progress !== undefined && data.progress >= 100)) {
          isLoading.value = false
          ws.close()
        }
      } catch (e) {
        error.value = 'Failed to parse server response.'
        isLoading.value = false
        ws.close()
      }
    }
    ws.onclose = () => {
      isLoading.value = false
    }
  } catch (e) {
    error.value = 'Failed to upload PDF.'
    isLoading.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)" v-if="isDesktop">
    <SheetContent side="right" class="max-w-lg w-full">
      <SheetHeader>
        <SheetTitle>Upload PDF (SAQ)</SheetTitle>
      </SheetHeader>
      <div class="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        <div v-if="isLoading" class="mb-2">
          <div
            class="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded text-sm flex items-center gap-2"
          >
            <AlertTriangle class="w-4 h-4" />
            <span>
              Please do not close this dialog while processing. Progress will be lost if you close
              it early.
            </span>
          </div>
        </div>
        <div v-if="progressMessage" class="mb-2">
          <div class="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
            {{ progressMessage }}
          </div>
        </div>
        <div
          v-if="error"
          class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
        >
          <AlertTriangle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>
        <div v-if="!saqData">
          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
          >
            <Upload class="w-8 h-8 mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ file ? file.name : 'Click to upload PDF file' }}
            </p>
            <input
              type="file"
              class="hidden"
              accept="application/pdf"
              @change="handleFileChange"
              :disabled="isLoading"
            />
          </label>
          <Button class="w-full mt-4" :disabled="!file || isLoading" @click="handleUpload">
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoading ? 'Processing...' : 'Upload & Parse PDF' }}
          </Button>
        </div>
        <div v-else>
          <div class="font-semibold mb-2">Raw SAQ Data Received:</div>
          <pre class="bg-muted/50 rounded p-2 text-xs overflow-x-auto">{{ JSON.stringify(saqData, null, 2) }}</pre>
        </div>
      </div>
      <SheetFooter class="mt-6">
        <SheetClose as-child>
          <Button variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
  <Dialog :open="open" @update:open="emit('update:open', $event)" v-if="!isDesktop">
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Upload PDF (SAQ)</DialogTitle>
      </DialogHeader>
      <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div v-if="isLoading" class="mb-2">
          <div
            class="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded text-sm flex items-center gap-2"
          >
            <AlertTriangle class="w-4 h-4" />
            <span>
              Please do not close this dialog while processing. Progress will be lost if you close
              it early.
            </span>
          </div>
        </div>
        <div v-if="progressMessage" class="mb-2">
          <div class="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
            {{ progressMessage }}
          </div>
        </div>
        <div
          v-if="error"
          class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
        >
          <AlertTriangle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>
        <div v-if="!saqData">
          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
          >
            <Upload class="w-8 h-8 mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ file ? file.name : 'Click to upload PDF file' }}
            </p>
            <input
              type="file"
              class="hidden"
              accept="application/pdf"
              @change="handleFileChange"
              :disabled="isLoading"
            />
          </label>
          <Button class="w-full mt-4" :disabled="!file || isLoading" @click="handleUpload">
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoading ? 'Processing...' : 'Upload & Parse PDF' }}
          </Button>
        </div>
        <div v-else>
          <div class="font-semibold mb-2">Raw SAQ Data Received:</div>
          <pre class="bg-muted/50 rounded p-2 text-xs overflow-x-auto">{{ JSON.stringify(saqData, null, 2) }}</pre>
        </div>
      </div>
      <SheetFooter class="mt-6">
        <SheetClose as-child>
          <Button variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter>
    </DialogContent>
  </Dialog>
</template>
