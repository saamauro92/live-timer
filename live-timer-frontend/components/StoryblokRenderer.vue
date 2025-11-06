<template>
  <div v-if="story">
    <StoryblokComponentVue
      v-for="blok in body"
      :key="blok._uid"
      :blok="blok as unknown as StoryblokComponent"
    />
  </div>
  <div v-else-if="loading" class="flex items-center justify-center min-h-screen">
    <div class="text-gray-600 dark:text-gray-400">Loading...</div>
  </div>
  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
      <p class="text-gray-600 dark:text-gray-400">The requested page could not be found.</p>
      <NuxtLink to="/" class="mt-4 inline-block text-blue-600 hover:text-blue-700">
        Go to Homepage
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoryblokStory, StoryblokComponent } from '~/types/storyblok'
import StoryblokComponentVue from './StoryblokComponent.vue'

interface Props {
  story?: StoryblokStory | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  story: null,
  loading: false,
})

const body = computed(() => {
  if (!props.story?.content?.body) return []
  return props.story.content.body as StoryblokComponent[]
})
</script>

