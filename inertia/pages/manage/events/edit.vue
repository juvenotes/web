<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Calendar, ArrowLeft, Save } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Link } from '@inertiajs/vue3'
import { ref, onMounted } from 'vue'
import type EventDto from '#dtos/event'

defineOptions({ layout: AdminLayout })

interface Props {
  event: EventDto
}

const props = defineProps<Props>()

const form = useForm({
  title: '',
  description: '',
  content: '',
  eventType: 'webinar',
  status: 'draft',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  venue: '',
  address: '',
  onlineLink: '',
  isOnline: false,
  isFree: true,
  price: '',
  currency: 'USD',
  maxParticipants: '',
  imageUrl: '',
  image: null as File | null,
})

const imagePreview = ref<string | null>(null)
const imageError = ref<string | null>(null)

const eventTypes = [
  { value: 'webinar', label: 'Webinar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Conference' },
  { value: 'exam', label: 'Exam' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'KES', label: 'KES (Ksh)' },
]

// Initialize form with event data
onMounted(() => {
  form.title = props.event.title
  form.description = props.event.description || ''
  form.content = props.event.content || ''
  form.eventType = props.event.eventType
  form.status = props.event.status
  form.startDate = props.event.startDate ? new Date(props.event.startDate).toISOString().slice(0, 16) : ''
  form.endDate = props.event.endDate ? new Date(props.event.endDate).toISOString().slice(0, 16) : ''
  form.registrationDeadline = props.event.registrationDeadline 
    ? new Date(props.event.registrationDeadline).toISOString().slice(0, 16) 
    : ''
  form.venue = props.event.venue || ''
  form.address = props.event.address || ''
  form.onlineLink = props.event.onlineLink || ''
  form.isOnline = props.event.isOnline
  form.isFree = props.event.isFree
  form.price = props.event.price?.toString() || ''
  form.currency = props.event.currency
  form.maxParticipants = props.event.maxParticipants?.toString() || ''
  form.imageUrl = props.event.imageUrl || ''
})

function handleImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    const file = input.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      imageError.value = 'Please select a valid image file'
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      imageError.value = 'Image size must be less than 5MB'
      return
    }
    
    form.image = file
    imageError.value = null
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  form.image = null
  form.imageUrl = ''
  imagePreview.value = null
  imageError.value = null
}

function handleSubmit() {
  form.put(`/manage/events/${props.event.slug}`, {
    forceFormData: true,
    preserveScroll: true,
  })
}

function getStatusColor(status: string) {
  const colors = {
    published: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return colors[status as keyof typeof colors] || colors.draft
}

function getEventTypeColor(type: string) {
  const colors = {
    webinar: 'bg-blue-50 text-blue-700 border-blue-200',
    workshop: 'bg-green-50 text-green-700 border-green-200',
    conference: 'bg-purple-50 text-purple-700 border-purple-200',
    exam: 'bg-red-50 text-red-700 border-red-200',
    seminar: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    meeting: 'bg-gray-50 text-gray-700 border-gray-200',
    other: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }
  return colors[type as keyof typeof colors] || colors.other
}
</script>

<template>
  <AppHead :title="`Edit ${event.title}`" />
  
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      
      <div class="mt-4 flex items-start gap-4">
        <Link 
          :href="`/manage/events/${event.slug}`"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft class="h-5 w-5 text-gray-600" />
        </Link>
        
        <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <Calendar class="h-6 w-6 text-primary" />
        </div>

        <div class="space-y-2 flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-foreground">Edit Event</h1>
            <Badge :class="getStatusColor(event.status)" class="text-xs">
              {{ event.status }}
            </Badge>
            <Badge :class="getEventTypeColor(event.eventType)" class="text-xs">
              {{ event.eventType }}
            </Badge>
          </div>
          <p class="text-base text-muted-foreground/90 max-w-2xl">
            {{ event.title }}
          </p>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Basic Information -->
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <Label for="title">Event Title *</Label>
              <Input
                id="title"
                v-model="form.title"
                placeholder="Enter event title..."
                :class="{ 'border-red-500': form.errors.title }"
                required
              />
              <p v-if="form.errors.title" class="text-sm text-red-600 mt-1">{{ form.errors.title }}</p>
            </div>

            <div>
              <Label for="eventType">Event Type *</Label>
              <select
                id="eventType"
                v-model="form.eventType"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option v-for="type in eventTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <p v-if="form.errors.eventType" class="text-sm text-red-600 mt-1">{{ form.errors.eventType }}</p>
            </div>
          </div>

          <div>
            <Label for="status">Status</Label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent max-w-xs"
            >
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
            <p v-if="form.errors.status" class="text-sm text-red-600 mt-1">{{ form.errors.status }}</p>
          </div>

          <div>
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="Brief description of the event..."
              rows="3"
              :class="{ 'border-red-500': form.errors.description }"
            />
            <p v-if="form.errors.description" class="text-sm text-red-600 mt-1">{{ form.errors.description }}</p>
          </div>

          <div>
            <Label for="content">Detailed Content</Label>
            <Textarea
              id="content"
              v-model="form.content"
              placeholder="Detailed information about the event, agenda, requirements, etc..."
              rows="6"
              :class="{ 'border-red-500': form.errors.content }"
            />
            <p v-if="form.errors.content" class="text-sm text-red-600 mt-1">{{ form.errors.content }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Event Image -->
      <Card>
        <CardHeader>
          <CardTitle>Event Image</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Current Image -->
          <div v-if="event.imageUrl && !imagePreview" class="relative">
            <Label>Current Image</Label>
            <img
              :src="event.imageUrl"
              alt="Current event image"
              class="w-full h-64 object-cover rounded-lg border mt-2"
            />
          </div>

          <div>
            <Label for="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              v-model="form.imageUrl"
              placeholder="https://example.com/image.jpg"
              :disabled="!!form.image"
              :class="{ 'border-red-500': form.errors.imageUrl }"
            />
            <p v-if="form.errors.imageUrl" class="text-sm text-red-600 mt-1">{{ form.errors.imageUrl }}</p>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">OR</span>
          </div>

          <div>
            <Label for="image">Upload New Image</Label>
            <div class="mt-2">
              <input
                id="image"
                type="file"
                accept="image/*"
                @change="handleImageChange"
                :disabled="!!form.imageUrl"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-colors"
              />
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Max file size: 5MB. Supported formats: JPG, PNG, WebP
            </p>
            <p v-if="imageError" class="text-sm text-red-600 mt-1">{{ imageError }}</p>
          </div>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="relative">
            <Label>New Image Preview</Label>
            <img
              :src="imagePreview"
              alt="Image preview"
              class="w-full h-64 object-cover rounded-lg border mt-2"
            />
            <Button
              type="button"
              @click="removeImage"
              variant="outline"
              size="sm"
              class="absolute top-8 right-2 bg-white/90 hover:bg-white"
            >
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Date & Time -->
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <Label for="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                v-model="form.startDate"
                type="datetime-local"
                :class="{ 'border-red-500': form.errors.startDate }"
                required
              />
              <p v-if="form.errors.startDate" class="text-sm text-red-600 mt-1">{{ form.errors.startDate }}</p>
            </div>

            <div>
              <Label for="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                v-model="form.endDate"
                type="datetime-local"
                :class="{ 'border-red-500': form.errors.endDate }"
                required
              />
              <p v-if="form.errors.endDate" class="text-sm text-red-600 mt-1">{{ form.errors.endDate }}</p>
            </div>
          </div>

          <div>
            <Label for="registrationDeadline">Registration Deadline</Label>
            <Input
              id="registrationDeadline"
              v-model="form.registrationDeadline"
              type="datetime-local"
              :class="{ 'border-red-500': form.errors.registrationDeadline }"
            />
            <p v-if="form.errors.registrationDeadline" class="text-sm text-red-600 mt-1">{{ form.errors.registrationDeadline }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Location -->
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex items-center space-x-2">
            <input
              id="isOnline"
              v-model="form.isOnline"
              type="checkbox"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label for="isOnline">This is an online event</Label>
          </div>

          <div v-if="form.isOnline">
            <Label for="onlineLink">Meeting Link</Label>
            <Input
              id="onlineLink"
              v-model="form.onlineLink"
              placeholder="https://zoom.us/j/..."
              :class="{ 'border-red-500': form.errors.onlineLink }"
            />
            <p v-if="form.errors.onlineLink" class="text-sm text-red-600 mt-1">{{ form.errors.onlineLink }}</p>
          </div>

          <div v-else class="grid md:grid-cols-2 gap-6">
            <div>
              <Label for="venue">Venue</Label>
              <Input
                id="venue"
                v-model="form.venue"
                placeholder="Conference center, hotel, etc."
                :class="{ 'border-red-500': form.errors.venue }"
              />
              <p v-if="form.errors.venue" class="text-sm text-red-600 mt-1">{{ form.errors.venue }}</p>
            </div>

            <div>
              <Label for="address">Address</Label>
              <Input
                id="address"
                v-model="form.address"
                placeholder="Full address..."
                :class="{ 'border-red-500': form.errors.address }"
              />
              <p v-if="form.errors.address" class="text-sm text-red-600 mt-1">{{ form.errors.address }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pricing & Capacity -->
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Capacity</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex items-center space-x-2">
            <input
              id="isFree"
              v-model="form.isFree"
              type="checkbox"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label for="isFree">This is a free event</Label>
          </div>

          <div v-if="!form.isFree" class="grid md:grid-cols-2 gap-6">
            <div>
              <Label for="price">Price *</Label>
              <Input
                id="price"
                v-model="form.price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                :class="{ 'border-red-500': form.errors.price }"
              />
              <p v-if="form.errors.price" class="text-sm text-red-600 mt-1">{{ form.errors.price }}</p>
            </div>

            <div>
              <Label for="currency">Currency</Label>
              <select
                id="currency"
                v-model="form.currency"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option v-for="curr in currencies" :key="curr.value" :value="curr.value">
                  {{ curr.label }}
                </option>
              </select>
              <p v-if="form.errors.currency" class="text-sm text-red-600 mt-1">{{ form.errors.currency }}</p>
            </div>
          </div>

          <div>
            <Label for="maxParticipants">Maximum Participants</Label>
            <Input
              id="maxParticipants"
              v-model="form.maxParticipants"
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              :class="{ 'border-red-500': form.errors.maxParticipants }"
            />
            <p v-if="form.errors.maxParticipants" class="text-sm text-red-600 mt-1">{{ form.errors.maxParticipants }}</p>
            <p class="text-xs text-gray-500 mt-1">
              Current participants: {{ event.currentParticipants }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Link
          :href="`/manage/events/${event.slug}`"
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </Link>
        <Button 
          type="submit" 
          :disabled="form.processing"
          class="bg-primary hover:bg-primary/90"
        >
          <Save class="h-4 w-4 mr-2" />
          {{ form.processing ? 'Saving...' : 'Save Changes' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Custom styles for the form */
</style>