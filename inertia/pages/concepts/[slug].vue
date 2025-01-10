<script setup lang="ts">
interface Props {
  concept: ConceptDto
  breadcrumbs: Array<{title: string, slug: string}>
}

defineProps<Props>()
</script>

<template>
  <AppHead :title="concept.title" :description="concept.description" />
  
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb Navigation -->
    <nav class="flex mb-8 space-x-2 text-sm text-muted-foreground/70">
      <Link href="/concepts" class="hover:text-primary transition-colors">
        Concepts
      </Link>
      <span v-for="(crumb, index) in breadcrumbs" :key="index">
        <span class="mx-2">/</span>
        <Link 
          :href="`/concepts/${crumb.slug}`"
          class="hover:text-primary transition-colors"
        >
          {{ crumb.title }}
        </Link>
      </span>
    </nav>

    <!-- Concept Header -->
    <div class="space-y-6 mb-12">
      <h1 class="text-4xl font-bold text-foreground">
        {{ concept.title }}
      </h1>
      <p class="text-lg text-muted-foreground max-w-3xl">
        {{ concept.description }}
      </p>
    </div>

    <!-- Child Concepts -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="child in concept.children"
        :key="child.id"
        :href="`/concepts/${child.slug}`"
        class="group p-6 rounded-xl border border-border/40
               bg-gradient-to-br from-background to-muted/20
               hover:shadow-lg hover:border-primary/20
               transition-all duration-300"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold group-hover:text-primary transition-colors">
              {{ child.title }}
            </h3>
            <div class="rounded-full bg-primary/10 p-2">
              <svg 
                class="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <p class="text-sm text-muted-foreground line-clamp-2">
            {{ child.description }}
          </p>

          <div class="pt-4 border-t border-border/40">
            <span class="text-xs font-medium text-muted-foreground">
              {{ child.children?.length || 0 }} subconcepts
            </span>
          </div>
        </div>
      </Link>
    </div>
  </div>
</template>