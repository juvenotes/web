<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Upload, Loader2, AlertTriangle } from 'lucide-vue-next'
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue-sonner'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import type McqChoiceDto from '#dtos/mcq_choice'

// Use DTO types for upload shape
type McqChoiceUpload = Pick<McqChoiceDto, 'choiceText' | 'isCorrect' | 'explanation'>

// For upload, only a subset of QuestionDto is needed
interface QuestionUpload {
  questionText: string
  questionImagePath?: string | null
  choices: McqChoiceUpload[]
  explanation?: string | null
}

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const file = ref<File | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const questions = ref<QuestionUpload[]>([])
const isDesktop = ref(true)
const saving = ref<{ [idx: number]: boolean }>({})
const saved = ref<{ [idx: number]: boolean }>({})
const rawJson = ref<any>(null)
const lastJson = ref<any>(null)
const isSavingAll = ref(false)
const progressMessage = ref<string>('')

// Use environment variable for FastAPI websocket endpoint
const FASTAPI_WS_URL = import.meta.env.VITE_FASTAPI_WS_URL || 'ws://localhost:8000/ws-mcq-upload'

onMounted(() => {
  isDesktop.value = window.innerWidth > 768
})

function resetDialog() {
  file.value = null
  isLoading.value = false
  error.value = null
  questions.value = []
  rawJson.value = null
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
  questions.value = []
  progressMessage.value = ''
  try {
    const ws = new WebSocket(FASTAPI_WS_URL)
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
        lastJson.value = data
        rawJson.value = data
        if (data.progress !== undefined) {
          isLoading.value = true
          error.value = null
        }
        if (data.message) {
          showProgressToast(data.message)
        }
        if (Array.isArray(data.questions)) {
          questions.value = data.questions.map((q: any, i: number): QuestionUpload => {
            let correctIdx = -1
            if (typeof q.answer === 'string' && q.answer.length === 1) {
              correctIdx = q.answer.charCodeAt(0) - 65
            }
            let choicesArr: any[] = Array.isArray(q.choices) ? q.choices : []
            let explanationsArr: (string | null)[] = []
            if (choicesArr.length && typeof choicesArr[0] === 'object' && choicesArr[0] !== null) {
              explanationsArr = choicesArr.map((c: any) => c.explanation ?? '')
              choicesArr = choicesArr.map((c: any) => c.choiceText || c.text || c)
            }
            let questionText = q.stem || q.questionText || q.text || ''
            const mappedChoices: McqChoiceUpload[] = (choicesArr as any[]).map((c: any, idx: number) => {
              return {
                choiceText: typeof c === 'string' ? c : (c && c.choiceText) || (c && c.text) || '',
                isCorrect: idx === correctIdx,
                explanation:
                  idx === correctIdx
                    ? (q.explanation || explanationsArr[idx] || '')
                    : '',
              }
            })
            return {
              questionText,
              choices: mappedChoices,
              explanation: q.explanation || '',
              questionImagePath: q.questionImagePath || null,
            }
          })
        } else if (data.error) {
          error.value = data.error
        }
      } catch (e) {
        error.value = 'Failed to parse server response.'
      }
      if (questions.value.length || error.value) {
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

async function saveQuestion(q: QuestionUpload, idx: number) {
  saving.value[idx] = true
  try {
    const payload: {
      conceptSlug: string
      paperSlug: string
      questionText: string
      questionImagePath: string | null
      choices: McqChoiceUpload[]
      explanation: string | null
    } = {
      conceptSlug: props.concept.slug,
      paperSlug: props.paper.slug,
      questionText: q.questionText,
      questionImagePath: q.questionImagePath || null,
      choices: q.choices.map((c: McqChoiceUpload) => ({
        choiceText: c.choiceText,
        isCorrect: c.isCorrect,
        explanation: c.explanation || '',
      })),
      explanation: q.explanation || '',
    }
    await axios.post('/api/papers/add-mcq-question', payload)
    saved.value[idx] = true
    toast.success('Question saved!')
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Failed to save question')
  } finally {
    saving.value[idx] = false
  }
}

async function saveAllQuestions() {
  if (!questions.value.length) return
  isSavingAll.value = true
  try {
    for (let i = 0; i < questions.value.length; i++) {
      if (!saved.value[i]) {
        await saveQuestion(questions.value[i], i)
      }
    }
    toast.success('All questions saved!')
  } catch (e: any) {
    toast.error('Failed to save all questions')
  } finally {
    isSavingAll.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)" v-if="isDesktop">
    <SheetContent side="right" class="max-w-lg w-full">
      <SheetHeader>
        <SheetTitle>Upload PDF (AI)</SheetTitle>
      </SheetHeader>
      <div class="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        <div v-if="isLoading" class="mb-2">
          <div class="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded text-sm flex items-center gap-2">
            <AlertTriangle class="w-4 h-4" />
            <span>
              Please do not close this dialog while processing. Progress will be lost if you close it early.
            </span>
          </div>
        </div>
        <div v-if="progressMessage" class="mb-2">
          <div class="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
            {{ progressMessage }}
          </div>
        </div>
        <div v-if="error" class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertTriangle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>
        <div v-if="!questions.length">
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
          <div class="flex items-center gap-4 mb-2">
            <span class="font-semibold">Parsed Questions (Pending Save):</span>
            <Button
              size="sm"
              :disabled="isSavingAll || questions.every((_, idx) => saved[idx])"
              @click="saveAllQuestions"
            >
              <Loader2 v-if="isSavingAll" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSavingAll ? 'Saving All...' : 'Save All' }}
            </Button>
          </div>
          <div class="space-y-4">
            <div v-for="(q, idx) in questions" :key="idx" class="p-4 border rounded-lg bg-muted/50">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                  >Q{{ idx + 1 }}</span
                >
                <span
                  v-if="saved[idx]"
                  class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold ml-2"
                  >Saved</span
                >
                <span
                  v-else
                  class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold ml-2"
                  >Pending Save</span
                >
              </div>
              <div class="text-sm font-medium mb-2">{{ q.questionText }}</div>
              <ul v-if="q.choices && q.choices.length" class="pl-4 space-y-1">
                <li v-for="(choice, cidx) in q.choices" :key="cidx" class="flex items-center gap-2">
                  <span
                    class="h-3 w-3 rounded-full border"
                    :class="{ 'bg-primary border-primary': choice.isCorrect }"
                  ></span>
                  <span class="text-sm">{{ choice.choiceText }}</span>
                  <span v-if="choice.isCorrect" class="ml-2 text-xs text-green-600 font-semibold"
                    >Correct</span
                  >
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
                  :disabled="saving[idx] || isSavingAll"
                  @click="saveQuestion(q, idx)"
                >
                  <Loader2 v-if="saving[idx]" class="w-4 h-4 mr-2 animate-spin" />
                  Save
                </Button>
                <Badge v-if="saved[idx]" variant="outline" class="bg-green-50 text-green-700"
                  >Saved</Badge
                >
              </div>
            </div>
          </div>
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
      <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div v-if="isLoading" class="mb-2">
          <div class="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded text-sm flex items-center gap-2">
            <AlertTriangle class="w-4 h-4" />
            <span>
              Please do not close this dialog while processing. Progress will be lost if you close it early.
            </span>
          </div>
        </div>
        <div v-if="progressMessage" class="mb-2">
          <div class="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
            {{ progressMessage }}
          </div>
        </div>
        <div v-if="error" class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertTriangle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>
        <div v-if="!questions.length">
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
          <div class="flex items-center gap-4 mb-2">
            <span class="font-semibold">Parsed Questions (Pending Save):</span>
            <Button
              size="sm"
              :disabled="isSavingAll || questions.every((_, idx) => saved[idx])"
              @click="saveAllQuestions"
            >
              <Loader2 v-if="isSavingAll" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSavingAll ? 'Saving All...' : 'Save All' }}
            </Button>
          </div>
          <div class="space-y-4">
            <div v-for="(q, idx) in questions" :key="idx" class="p-4 border rounded-lg bg-muted/50">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                  >Q{{ idx + 1 }}</span
                >
                <span
                  v-if="saved[idx]"
                  class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold ml-2"
                  >Saved</span
                >
                <span
                  v-else
                  class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold ml-2"
                  >Pending Save</span
                >
              </div>
              <div class="text-sm font-medium mb-2">{{ q.questionText }}</div>
              <ul v-if="q.choices && q.choices.length" class="pl-4 space-y-1">
                <li v-for="(choice, cidx) in q.choices" :key="cidx" class="flex items-center gap-2">
                  <span
                    class="h-3 w-3 rounded-full border"
                    :class="{ 'bg-primary border-primary': choice.isCorrect }"
                  ></span>
                  <span class="text-sm">{{ choice.choiceText }}</span>
                  <span v-if="choice.isCorrect" class="ml-2 text-xs text-green-600 font-semibold"
                    >Correct</span
                  >
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
                  :disabled="saving[idx] || isSavingAll"
                  @click="saveQuestion(q, idx)"
                >
                  <Loader2 v-if="saving[idx]" class="w-4 h-4 mr-2 animate-spin" />
                  Save
                </Button>
                <Badge v-if="saved[idx]" variant="outline" class="bg-green-50 text-green-700"
                  >Saved</Badge
                >
              </div>
            </div>
          </div>
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
