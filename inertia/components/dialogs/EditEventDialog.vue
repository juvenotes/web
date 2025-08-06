<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { ref, watch, onMounted } from 'vue'
import { Trash, Loader } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  event: any
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'updated': [event: any]
}>()

const form = useForm({
  title: '',
  event_type: 'webinar',
  start_date: '',
  end_date: '',
  imageUrl: '',
})

const isUploadingImage = ref(false)

const initializeForm = () => {
  form.title = props.event?.title || ''
  form.event_type = props.event?.event_type || 'webinar'
  form.start_date = props.event?.start_date || ''
  form.end_date = props.event?.end_date || ''
  form.imageUrl = props.event?.imageUrl || ''
  form.clearErrors()
}

watch(() => props.open, (isOpen) => {
  if (isOpen) initializeForm()
})

onMounted(() => {
  initializeForm()
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
  if (!props.event?.slug) return
  form.put(`/manage/events/${props.event.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      initializeForm()
    },
    onError: (errors) => {
      console.error('Submitted fields:', { ...form })
      console.error('Validation errors:', errors, JSON.parse(JSON.stringify(form.errors)))
    },
  })
}

const presetItems = [
  { value: 0, label: 'Today' },
  { value: 1, label: 'Tomorrow' },
  { value: 3, label: 'In 3 days' },
  { value: 7, label: 'In a week' },
]
const startDateValue = ref()
const endDateValue = ref()

watch([startDateValue], ([date]) => {
  if (date) {
    const d = date.toDate()
    form.start_date = d.toISOString().slice(0, 16)
  } else {
    form.start_date = ''
  }
})

watch([endDateValue], ([date]) => {
  if (date) {
    const d = date.toDate()
    form.end_date = d.toISOString().slice(0, 16)
  } else {
    form.end_date = ''
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader class="bg-background/95 backdrop-blur-sm z-20 p-4 sm:pb-4 border-b max-w-screen-lg mx-auto">
        <DialogTitle class="text-lg sm:text-xl">Edit Event</DialogTitle>
      </DialogHeader>
      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <div class="space-y-2 sm:space-y-3">
            <Label>Title</Label>
            <Input v-model="form.title" :class="{ 'border-destructive': form.errors.title }" />
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>Type</Label>
            <Select v-model="form.event_type">
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
              <option value="exam">Exam</option>
              <option value="seminar">Seminar</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>Start Date & Time</Label>
            <Input type="datetime-local" v-model="form.start_date" :class="{ 'border-destructive': form.errors.start_date }" />
            <span v-if="form.errors.start_date" class="text-sm text-destructive">{{ form.errors.start_date }}</span>
          </div>
          <div class="space-y-2 sm:space-y-3">
            <Label>End Date & Time</Label>
            <Input type="datetime-local" v-model="form.end_date" :class="{ 'border-destructive': form.errors.end_date }" />
            <span v-if="form.errors.end_date" class="text-sm text-destructive">{{ form.errors.end_date }}</span>
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
              <Loader class="h-4 w-4 animate-spin" />
              <span>Uploading image...</span>
            </div>
          </div>
          <Button type="submit" :disabled="form.processing" class="w-full h-10 sm:h-11">
            {{ form.processing ? 'Saving...' : 'Save Changes' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
