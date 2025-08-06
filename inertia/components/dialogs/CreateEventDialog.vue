<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { ref, watch, onMounted } from 'vue'
import { Plus, Trash } from 'lucide-vue-next'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '~/lib/utils'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': [event: any]
}>()

const form = useForm({
  title: '',
  eventType: 'webinar',
  startDate: '',
  endDate: '',
  imageUrl: '',
})

const isUploadingImage = ref(false)
const error = ref('')

const presetItems = [
  { value: 0, label: 'Today' },
  { value: 1, label: 'Tomorrow' },
  { value: 3, label: 'In 3 days' },
  { value: 7, label: 'In a week' },
]
const startDateValue = ref<DateValue>()
const endDateValue = ref<DateValue>()
const startTime = ref('')
const endTime = ref('')

const initializeForm = () => {
  form.title = ''
  form.eventType = 'webinar'
  form.startDate = ''
  form.endDate = ''
  form.imageUrl = ''
  form.clearErrors()
}

watch(() => props.open, (isOpen) => {
  if (isOpen) initializeForm()
})

onMounted(() => {
  initializeForm()
})

watch(startDateValue, (val) => {
  form.startDate = val ? val.toDate(getLocalTimeZone()).toISOString() : ''
})
watch(endDateValue, (val) => {
  form.endDate = val ? val.toDate(getLocalTimeZone()).toISOString() : ''
})

watch([startDateValue, startTime], ([date, time]) => {
  if (date && time) {
    const d = date.toDate(getLocalTimeZone())
    const [hours, minutes] = time.split(':')
    d.setHours(Number(hours), Number(minutes), 0, 0)
    form.startDate = d.toISOString()
  } else {
    form.startDate = ''
  }
})

watch([endDateValue, endTime], ([date, time]) => {
  if (date && time) {
    const d = date.toDate(getLocalTimeZone())
    const [hours, minutes] = time.split(':')
    d.setHours(Number(hours), Number(minutes), 0, 0)
    form.endDate = d.toISOString()
  } else {
    form.endDate = ''
  }
})

async function handleImageUpload(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('context[folder]', 'events')

  try {
    isUploadingImage.value = true
    const { data } = await axios.post('/api/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.imageUrl = data
  } catch (error) {
    console.error('Failed to upload image:', error)
  } finally {
    isUploadingImage.value = false
  }
}

function removeImage() {
  form.imageUrl = ''
}

const handleSubmit = () => {
  form.post('/manage/events', {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      initializeForm()
      error.value = ''
    },
    onError: (errors) => {
      error.value = errors?.message || 'Validation errors: ' + JSON.stringify(form.errors)
      console.error('Submitted fields:', { ...form })
      console.error('Validation errors:', errors, JSON.parse(JSON.stringify(form.errors)))
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader class="bg-background/95 backdrop-blur-sm z-20 p-4 sm:pb-4 border-b max-w-screen-lg mx-auto">
        <DialogTitle class="text-lg sm:text-xl">Create Event</DialogTitle>
      </DialogHeader>
      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <div class="space-y-2 sm:space-y-3">
            <Label>Title</Label>
            <Input v-model="form.title" :class="{ 'border-destructive': form.errors.title }" />
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>Type</Label>
            <Select v-model="form.eventType">
              <SelectTrigger :class="{ 'border-destructive': form.errors.eventType }">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <span v-if="form.errors.eventType" class="text-sm text-destructive">{{ form.errors.eventType }}</span>
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>Start Date</Label>
            <Input type="date" v-model="form.startDate" :class="{ 'border-destructive': form.errors.startDate }" />
            <span v-if="form.errors.startDate" class="text-sm text-destructive">{{ form.errors.startDate }}</span>
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>End Date</Label>
            <Input type="date" v-model="form.endDate" :class="{ 'border-destructive': form.errors.endDate }" />
            <span v-if="form.errors.endDate" class="text-sm text-destructive">{{ form.errors.endDate }}</span>
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>Event Image (Optional)</Label>
            <Input type="file" accept="image/*" :disabled="isUploadingImage" @input="(e: any) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }" />
            <div v-if="form.imageUrl" class="relative w-full">
              <img :src="form.imageUrl" class="max-h-40 rounded-lg object-cover" alt="Event image preview" />
              <Button type="button" variant="destructive" size="icon" class="absolute top-2 right-2" @click="removeImage">
                <Trash class="h-4 w-4" />
              </Button>
            </div>
            <div v-if="isUploadingImage" class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              <span>Uploading image...</span>
            </div>
          </div>
          <div v-if="error" class="text-sm text-destructive">
            {{ error }}
          </div>
          <Button type="submit" :disabled="form.processing" class="w-full h-10 sm:h-11">
            {{ form.processing ? 'Creating...' : 'Create Event' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
