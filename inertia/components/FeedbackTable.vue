<script setup lang="ts">
import type QuestionFeedbackDto from '#dtos/question_feedback'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { toast } from 'vue-sonner'
import axios from 'axios'

defineProps<{
  items: QuestionFeedbackDto[]
}>()

const markAsResolved = async (id: number) => {
  try {
    await axios.post(`/manage/feedback/${id}/resolve`)
    toast.success('Feedback marked as resolved')
  } catch (error) {
    console.error('Failed to mark feedback as resolved:', error)
    toast.error('Failed to mark feedback as resolved')
  }
}
</script>

<template>
  <div class="space-y-4">
    <Table>
      <TableHeader>
        <TableRow class="hidden sm:table-row">
          <TableHead>Source</TableHead>
          <TableHead>Target</TableHead>
          <TableHead class="max-w-[300px]">Feedback</TableHead>
          <TableHead class="w-[100px]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in items" :key="item.id" class="block sm:table-row">
          <TableCell data-label="Source" class="block sm:table-cell">
            <div class="flex flex-col">
              <span class="sm:hidden font-medium mb-1">Source:</span>
              <span class="line-clamp-2">{{ item.feedbackSource }}</span>
            </div>
          </TableCell>
          <TableCell data-label="Target" class="block sm:table-cell">
            <div class="flex flex-col">
              <span class="sm:hidden font-medium mb-1">Target:</span>
              <span class="capitalize">{{ item.feedbackTarget }}</span>
            </div>
          </TableCell>
          <TableCell data-label="Feedback" class="block sm:table-cell">
            <div class="flex flex-col">
              <span class="sm:hidden font-medium mb-1">Feedback:</span>
              <p class="line-clamp-3">{{ item.feedbackText }}</p>
            </div>
          </TableCell>
          <TableCell class="block sm:table-cell">
            <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span class="sm:hidden font-medium">Action:</span>
              <Button
                v-if="!item.isResolved"
                size="sm"
                variant="outline"
                @click="markAsResolved(item.id)"
              >
                Mark Resolved
              </Button>
              <span v-else class="text-green-600 text-sm">Resolved</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="items.length === 0">
          <TableCell colspan="4" class="h-24 text-center">No feedback found</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  :deep(td) {
    display: grid;
    grid-template-columns: 1fr;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  :deep(td:not(:last-child)) {
    border-bottom: 0;
  }

  :deep(tr) {
    margin-bottom: 1rem;
    display: block;
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
  }
}
</style>
