<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Upload, Loader2, AlertTriangle } from 'lucide-vue-next'
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue-sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '~/components/ui/sheet'
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
const questions = ref<any[]>([])
const debugMessages = ref<string[]>([])
const isDesktop = ref(true)
const saving = ref<{ [idx: number]: boolean }>({})
const saved = ref<{ [idx: number]: boolean }>({})

onMounted(() => {
  isDesktop.value = window.innerWidth > 768
})

function resetDialog() {
  file.value = null
  isLoading.value = false
  error.value = null
  questions.value = []
  debugMessages.value = []
}

function addDebug(msg: string) {
  debugMessages.value.push(msg)
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
  questions.value = []
  debugMessages.value = []
  try {
    const ws = new WebSocket('ws://localhost:8000/ws-mcq-upload')
    ws.binaryType = 'arraybuffer'
    ws.onopen = () => {
      addDebug('[client] WebSocket opened')
      const reader = new FileReader()
      reader.onload = () => {
        addDebug('[client] Sending PDF file as ArrayBuffer')
        ws.send(reader.result as ArrayBuffer)
      }
      reader.readAsArrayBuffer(file.value!)
    }
    ws.onerror = (e) => {
      error.value = 'WebSocket connection failed.'
      addDebug('[client] WebSocket error: ' + JSON.stringify(e))
      isLoading.value = false
    }
    ws.onmessage = (event) => {
      addDebug('[server] ' + event.data)
      try {
        const data = JSON.parse(event.data)
        if (data.progress !== undefined) {
          // Show progress and message if present
          isLoading.value = true
          error.value = null
        }
        if (data.message) {
          addDebug('[server message] ' + data.message)
        }
        if (Array.isArray(data.questions)) {
          questions.value = data.questions
        } else if (data.error) {
          error.value = data.error
        }
      } catch (e) {
        error.value = 'Failed to parse server response.'
        addDebug('[client] JSON parse error: ' + String(e))
      }
      if (questions.value.length || error.value) {
        isLoading.value = false
        ws.close()
      }
    }
    ws.onclose = () => {
      addDebug('[client] WebSocket closed')
      isLoading.value = false
    }
  } catch (e) {
    error.value = 'Failed to upload PDF.'
    addDebug('[client] Exception: ' + String(e))
    isLoading.value = false
  }
}

async function saveQuestion(q: any, idx: number) {
  saving.value[idx] = true
  try {
    // Build payload as expected by addMcqQuestion
    const payload = {
      questionText: q.questionText,
      questionImagePath: q.questionImagePath || null,
      choices: q.choices.map((c: any) => ({
        choiceText: c.choiceText,
        isCorrect: c.isCorrect,
        explanation: c.explanation || '',
      })),
    }
    await axios.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/mcq`, payload)
    saved.value[idx] = true
    toast.success('Question saved!')
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Failed to save question')
  } finally {
    saving.value[idx] = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)" v-if="isDesktop">
    <SheetContent side="right" class="max-w-lg w-full">
      <SheetHeader>
        <SheetTitle>Upload PDF (AI)</SheetTitle>
      </SheetHeader>
      <div class="space-y-6">
        <div v-if="error" class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertTriangle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>
        <div v-if="!questions.length">
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
            <Upload class="w-8 h-8 mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ file ? file.name : 'Click to upload PDF file' }}
            </p>
            <input type="file" class="hidden" accept="application/pdf" @change="handleFileChange" :disabled="isLoading" />
          </label>
          <Button class="w-full mt-4" :disabled="!file || isLoading" @click="handleUpload">
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoading ? 'Processing...' : 'Upload & Parse PDF' }}
          </Button>
        </div>
        <div v-else>
          <div class="mb-4">
            <span class="font-semibold">Parsed Questions (Pending Save):</span>
          </div>
          <div class="space-y-4">
            <div v-for="(q, idx) in questions" :key="idx" class="p-4 border rounded-lg bg-muted/50">
              <div class="flex items-center gap-2 mb-2">
                <span class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Q{{ idx + 1 }}</span>
                <span v-if="saved[idx]" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold ml-2">Saved</span>
                <span v-else class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold ml-2">Pending Save</span>
              </div>
              <div class="text-sm font-medium mb-2">{{ q.questionText }}</div>
              <ul v-if="q.choices && q.choices.length" class="pl-4 space-y-1">
                <li v-for="(choice, cidx) in q.choices" :key="cidx" class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full border" :class="{ 'bg-primary border-primary': choice.isCorrect }"></span>
                  <span class="text-sm">{{ choice.choiceText }}</span>
                  <span v-if="choice.isCorrect" class="ml-2 text-xs text-green-600 font-semibold">Correct</span>
                </li>
              </ul>
              <div v-if="q.explanation" class="mt-2 text-xs text-muted-foreground">
                <span class="font-semibold">Explanation:</span> {{ q.explanation }}
              </div>
              <div class="mt-3 flex gap-2">
                <Button
                  v-if="!saved[idx]"
                  size="sm"
                  :loading="saving[idx]"
                  :disabled="saving[idx]"
                  @click="saveQuestion(q, idx)"
                >
                  <Loader2 v-if="saving[idx]" class="w-4 h-4 mr-2 animate-spin" />
                  Save
                </Button>
                <Badge v-if="saved[idx]" variant="outline" class="bg-green-50 text-green-700">Saved</Badge>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <details>
            <summary class="cursor-pointer text-xs text-muted-foreground">Show Debug Messages</summary>
            <div class="mt-2 max-h-40 overflow-auto bg-muted/30 p-2 rounded text-xs font-mono">
              <div v-for="(msg, i) in debugMessages" :key="i">{{ msg }}</div>
            </div>
          </details>
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
        <DialogTitle>Upload PDF (AI)</DialogTitle>
      </DialogHeader>
      <div class="space-y-6">
        <div v-if="error" class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertTriangle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>
        <div v-if="!questions.length">
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
            <Upload class="w-8 h-8 mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ file ? file.name : 'Click to upload PDF file' }}
            </p>
            <input type="file" class="hidden" accept="application/pdf" @change="handleFileChange" :disabled="isLoading" />
          </label>
          <Button class="w-full mt-4" :disabled="!file || isLoading" @click="handleUpload">
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoading ? 'Processing...' : 'Upload & Parse PDF' }}
          </Button>
        </div>
        <div v-else>
          <div class="mb-4">
            <span class="font-semibold">Parsed Questions (Pending Save):</span>
          </div>
          <div class="space-y-4">
            <div v-for="(q, idx) in questions" :key="idx" class="p-4 border rounded-lg bg-muted/50">
              <div class="flex items-center gap-2 mb-2">
                <span class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Q{{ idx + 1 }}</span>
                <span v-if="saved[idx]" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold ml-2">Saved</span>
                <span v-else class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold ml-2">Pending Save</span>
              </div>
              <div class="text-sm font-medium mb-2">{{ q.questionText }}</div>
              <ul v-if="q.choices && q.choices.length" class="pl-4 space-y-1">
                <li v-for="(choice, cidx) in q.choices" :key="cidx" class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full border" :class="{ 'bg-primary border-primary': choice.isCorrect }"></span>
                  <span class="text-sm">{{ choice.choiceText }}</span>
                  <span v-if="choice.isCorrect" class="ml-2 text-xs text-green-600 font-semibold">Correct</span>
                </li>
              </ul>
              <div v-if="q.explanation" class="mt-2 text-xs text-muted-foreground">
                <span class="font-semibold">Explanation:</span> {{ q.explanation }}
              </div>
              <div class="mt-3 flex gap-2">
                <Button
                  v-if="!saved[idx]"
                  size="sm"
                  :loading="saving[idx]"
                  :disabled="saving[idx]"
                  @click="saveQuestion(q, idx)"
                >
                  <Loader2 v-if="saving[idx]" class="w-4 h-4 mr-2 animate-spin" />
                  Save
                </Button>
                <Badge v-if="saved[idx]" variant="outline" class="bg-green-50 text-green-700">Saved</Badge>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <details>
            <summary class="cursor-pointer text-xs text-muted-foreground">Show Debug Messages</summary>
            <div class="mt-2 max-h-40 overflow-auto bg-muted/30 p-2 rounded text-xs font-mono">
              <div v-for="(msg, i) in debugMessages" :key="i">{{ msg }}</div>
            </div>
          </details>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
