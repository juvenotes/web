<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { TodayStatus } from '#enums/today_status'
import { DateTime } from 'luxon'
import { Wand2 } from 'lucide-vue-next'
import { watch, onMounted } from 'vue'
import type TodayDto from '#dtos/today'

const props = defineProps<{
  open: boolean
  today: TodayDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  scheduledFor: '',
  status: '' as TodayStatus,
})
// Initialize form with today's data
const initializeForm = () => {
  form.title = props.today.title
  form.scheduledFor = props.today.scheduledFor
  form.status = props.today.status

  form.clearErrors()
}

// Watch dialog open state to initialize form
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      initializeForm()
    }
  }
)

// Auto-generate a formatted title based on the scheduled date
const autoGenerateTitle = () => {
  try {
    const date = DateTime.fromISO(form.scheduledFor)
    const formattedDate = date.toFormat('EEEE, MMM d')
    form.title = `Question of the Day: ${formattedDate}`
  } catch (e) {
    console.error('Error generating title:', e)
  }
}

// Initialize on mount
onMounted(() => {
  if (props.today) {
    initializeForm()
  }
})

function handleSubmit() {
  form.put(`/manage/today/${props.today.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Question of the Day</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Scheduled For (First Position) -->
        <div class="space-y-2">
          <Label>Scheduled For</Label>
          <Input
            type="date"
            v-model="form.scheduledFor"
            :class="{ 'border-destructive': form.errors.scheduledFor }"
          />
          <p v-if="form.errors.scheduledFor" class="text-sm text-destructive">
            {{ form.errors.scheduledFor }}
          </p>
          <p v-else class="text-sm text-muted-foreground">
            Select the date when this will be the question of the day
          </p>
        </div>

        <!-- Title with Auto-Generate Button -->
        <div class="space-y-2">
          <Label>Title</Label>
          <div class="flex gap-2">
            <Input
              v-model="form.title"
              class="flex-1"
              :class="{ 'border-destructive': form.errors.title }"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              @click="autoGenerateTitle"
              title="Auto-generate title from date"
            >
              <Wand2 class="h-4 w-4" />
            </Button>
          </div>
          <p v-if="form.errors.title" class="text-sm text-destructive">
            {{ form.errors.title }}
          </p>
          <p v-else class="text-sm text-muted-foreground">
            Enter a descriptive title or auto-generate from date
          </p>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <Label>Status</Label>
          <Select v-model="form.status">
            <SelectTrigger :class="{ 'border-destructive': form.errors.status }">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="TodayStatus.SCHEDULED">Scheduled</SelectItem>
              <SelectItem :value="TodayStatus.ACTIVE">Active</SelectItem>
              <SelectItem :value="TodayStatus.ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.status" class="text-sm text-destructive">
            {{ form.errors.status }}
          </p>
        </div>

        <Button type="submit" :disabled="form.processing" class="w-full">
          {{ form.processing ? 'Saving...' : 'Save Changes' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
