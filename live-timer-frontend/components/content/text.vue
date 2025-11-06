<template>
  <section class="py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 v-if="title" :class="titleClasses">
        {{ title }}
      </h2>
      <div v-if="content" class="prose prose-lg dark:prose-invert max-w-none">
        <StoryblokRichText :content="content" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TextContent } from '~/types/storyblok'

interface Props extends Partial<TextContent> {
  // Props are spread from StoryblokComponent, so we extend TextContent directly
}

const props = defineProps<Props>()

const title = computed(() => props.title || '')
const content = computed(() => props.content)
const alignment = computed(() => props.alignment || 'left')

const titleClasses = computed(() => {
  const base = 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6'
  const align = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return `${base} ${align[alignment.value]}`
})
</script>

