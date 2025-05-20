<script setup lang="ts">
import type QuestionFeedbackDto from '#dtos/question_feedback'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

defineProps<{
  items: QuestionFeedbackDto[]
}>()
</script>

<template>
  <div class="space-y-4">
    <Table>
      <TableHeader>
        <TableRow class="hidden sm:table-row">
          <TableHead class="text-xs uppercase tracking-wider text-muted-foreground">Source</TableHead>
          <TableHead class="text-xs uppercase tracking-wider text-muted-foreground">Target</TableHead>
          <TableHead class="max-w-[300px] text-xs uppercase tracking-wider text-muted-foreground">Feedback</TableHead>
          <TableHead class="w-[100px] text-xs uppercase tracking-wider text-muted-foreground">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in items" :key="item.id" class="block sm:table-row hover:bg-accent/10 transition-colors">
          <TableCell data-label="Source" class="block sm:table-cell py-3">
            <div class="flex flex-col">
              <span class="sm:hidden font-medium mb-1">Source:</span>
              <span class="line-clamp-2">{{ item.feedbackSource }}</span>
            </div>
          </TableCell>
          <TableCell data-label="Target" class="block sm:table-cell py-3">
            <div class="flex flex-col">
              <span class="sm:hidden font-medium mb-1">Target:</span>
              <span class="capitalize">{{ item.feedbackTarget }}</span>
            </div>
          </TableCell>
          <TableCell data-label="Feedback" class="block sm:table-cell py-3">
            <div class="flex flex-col">
              <span class="sm:hidden font-medium mb-1">Feedback:</span>
              <p class="line-clamp-3">{{ item.feedbackText }}</p>
            </div>
          </TableCell>
          <TableCell class="block sm:table-cell py-3">
            <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span class="sm:hidden font-medium">Action:</span>
              <Link
                :href="`/manage/feedback/question/${item.question?.slug}`"
                class="inline-flex h-9 items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors text-primary border border-primary/20 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 w-full sm:w-auto"
              >
                <span class="text-sm font-medium">Resolve</span>
              </Link>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="items.length === 0">
          <TableCell colspan="4" class="h-24 text-center text-muted-foreground">No feedback found</TableCell>
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
