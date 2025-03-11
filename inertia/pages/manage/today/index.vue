<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type TodayDto from '#dtos/today'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Calendar, Plus, Archive, Clock, CheckCircle, Eye } from 'lucide-vue-next'
import { TodayStatus } from '#enums/today_status'
import { computed, ref } from 'vue' // Added ref import
import { DateTime } from 'luxon'

defineOptions({ layout: AdminLayout })

interface Props {
  todayItems: TodayDto[]
}

const props = defineProps<Props>()
const showCreateDialog = ref(false) // Add ref to control dialog visibility

// Filter today items by status
const activeToday = computed(
  () => props.todayItems.filter((item) => item.status === TodayStatus.ACTIVE)[0] || null
)

const scheduledItems = computed(() =>
  props.todayItems
    .filter((item) => item.status === TodayStatus.SCHEDULED)
    .sort(
      (a, b) =>
        DateTime.fromISO(a.scheduledFor).toMillis() - DateTime.fromISO(b.scheduledFor).toMillis()
    )
)

const archivedItems = computed(() =>
  props.todayItems
    .filter((item) => item.status === TodayStatus.ARCHIVED)
    .sort(
      (a, b) => DateTime.fromISO(b.updatedAt).toMillis() - DateTime.fromISO(a.updatedAt).toMillis()
    )
)

const breadcrumbItems = [{ label: 'Today' }]

// Format the scheduled date for display
const formatScheduledDate = (dateString: string) => {
  try {
    return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED)
  } catch (e) {
    return dateString
  }
}
</script>

<template>
  <AppHead title="Today" description="Your daily question of the day" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Calendar class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">Question of the Day</h1>
            <p class="text-base text-muted-foreground/90 max-w-2xl">
              Organize (manually) what will be shown as the question of the day
            </p>
          </div>
        </div>
        <Link
          href="/today"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 text-gray-700 border border-gray-200 shadow-sm hover:shadow"
        >
          <Eye class="h-4 w-4" />
          <span class="text-sm font-medium">View</span>
        </Link>

        <!-- Changed from Link to Button that opens dialog -->
        <Button class="w-full sm:w-auto" @click="showCreateDialog = true">
          <Plus class="h-4 w-4 mr-2" />Create New
        </Button>
      </div>
    </div>

    <!-- Active Today Section -->
    <div v-if="activeToday" class="space-y-4">
      <div class="flex items-center gap-2">
        <CheckCircle class="h-5 w-5 text-green-500" />
        <h2 class="text-lg font-semibold">Today's Question</h2>
      </div>

      <Link
        :href="`/manage/today/${activeToday.slug}`"
        class="block p-6 bg-white rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-foreground">{{ activeToday.title }}</h3>
            <!-- <div class="flex flex-wrap items-center gap-2 mt-1">
              <span v-if="activeToday.studyLevel" class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {{ activeToday.studyLevel }}
              </span>
              <span class="text-sm text-muted-foreground">
                Unit: {{ activeToday.units || 'N/A' }}
              </span>
              <span class="text-sm text-muted-foreground">
                Topic: {{ activeToday.topics || 'N/A' }}
              </span>
            </div> -->
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">Active</span>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-2 text-primary font-medium">
          <span>View question</span>
          <svg
            class="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </Link>
    </div>

    <!-- Scheduled Items Section -->
    <div v-if="scheduledItems.length > 0" class="space-y-4">
      <div class="flex items-center gap-2">
        <Clock class="h-5 w-5 text-blue-500" />
        <h2 class="text-lg font-semibold">Scheduled Questions</h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="item in scheduledItems"
          :key="item.id"
          :href="`/manage/today/${item.slug}`"
          class="group p-5 bg-white rounded-xl border hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <h3 class="text-lg font-medium text-foreground">{{ item.title }}</h3>
          <!-- <div class="flex flex-wrap items-center gap-2 mt-1">
            <span v-if="item.studyLevel" class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {{ item.studyLevel }}
            </span>
          </div> -->

          <div class="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar class="h-4 w-4" />
            <span>Scheduled for: {{ formatScheduledDate(item.scheduledFor) }}</span>
          </div>

          <div
            class="mt-3 flex items-center text-primary text-sm font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span>View question</span>
            <svg
              class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>

    <!-- Archived Items Section -->
    <div v-if="archivedItems.length > 0" class="space-y-4">
      <div class="flex items-center gap-2">
        <Archive class="h-5 w-5 text-gray-500" />
        <h2 class="text-lg font-semibold">Archived Questions</h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="item in archivedItems"
          :key="item.id"
          :href="`/manage/today/${item.slug}`"
          class="group p-5 bg-white/80 rounded-xl border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <h3 class="text-lg font-medium text-foreground">{{ item.title }}</h3>
          <!-- <div class="flex flex-wrap items-center gap-2 mt-1">
            <span v-if="item.studyLevel" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {{ item.studyLevel }}
            </span>
          </div> -->

          <div class="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar class="h-4 w-4" />
            <span>Was for: {{ formatScheduledDate(item.scheduledFor) }}</span>
          </div>

          <div
            class="mt-3 flex items-center text-primary text-sm font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span>View question</span>
            <svg
              class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!activeToday && scheduledItems.length === 0 && archivedItems.length === 0"
      class="text-center py-16"
    >
      <Calendar class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 class="text-xl font-medium text-foreground mb-2">No questions created yet</h3>
      <p class="text-muted-foreground mb-6">Create your first question of the day</p>
      <!-- Changed from Link to Button that opens dialog -->
      <Button @click="showCreateDialog = true">
        <Plus class="h-4 w-4 mr-2" />Create Your First Question
      </Button>
    </div>

    <!-- Add the CreateTodayDialog component -->
    <CreateTodayDialog v-model:open="showCreateDialog" />
  </div>
</template>
