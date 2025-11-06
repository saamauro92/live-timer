<template>
  <div>
    <StoryblokComponentVue
      v-for="blok in body"
      :key="blok._uid"
      :blok="blok as unknown as StoryblokComponent"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageModule, StoryblokComponent } from '~/types/storyblok'
import StoryblokComponentVue from '../StoryblokComponent.vue'

interface Props extends Partial<PageModule> {
  // Props are spread from StoryblokComponent, so we extend PageModule directly
  // Using Partial to make all props optional for safety
}

const props = withDefaults(defineProps<Props>(), {
  body: () => [],
  title: '',
  description: '',
})

const body = computed(() => {
  // Handle both direct body prop and ensure it's an array
  const bodyContent = props.body
  if (Array.isArray(bodyContent)) {
    return bodyContent as StoryblokComponent[]
  }
  return []
})
</script>

