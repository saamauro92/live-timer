<template>
  <component :is="component" v-bind="blok" v-editable="blok" />
</template>

<script setup lang="ts">
import type { StoryblokComponent } from '~/types/storyblok'
import StoryblokHero from './blocks/hero.vue'
import StoryblokFeature from './blocks/feature.vue'
import StoryblokStep from './blocks/step.vue'
import StoryblokTestimonials from './blocks/testimonials.vue'
import StoryblokStats from './blocks/stats.vue'
import StoryblokFaq from './blocks/faq.vue'
import StoryblokText from './content/text.vue'
import StoryblokLink from './core/link.vue'
import StoryblokPage from './modules/page.vue'
import StoryblokFallback from './StoryblokFallback.vue'

interface Props {
  blok: StoryblokComponent
}

const props = defineProps<Props>()

// Map Storyblok component names to Vue components
// Supports both old format ('hero') and new format ('block/hero', 'modules/page', 'content/text')
const componentMap: Record<string, any> = {
  // Block components (nestable)
  'block/hero': StoryblokHero,
  'hero': StoryblokHero, // Legacy support
  'block/feature': StoryblokFeature,
  'feature': StoryblokFeature, // Legacy support
  'block/step': StoryblokStep,
  'block/steps': StoryblokStep, // Legacy support
  'block/testimonials': StoryblokTestimonials,
  'block/stats': StoryblokStats,
  'block/faq': StoryblokFaq,
  'block/slider': StoryblokFallback, // TODO: Create slider component in blocks/
  
  // Content components (rich text, core)
  'content/text': StoryblokText,
  'text': StoryblokText, // Legacy support
  
  // Core components (reusable)
  'core/link': StoryblokLink,
  'link': StoryblokLink, // Legacy support
  'Link': StoryblokLink, // Storyblok format (capital L)
  
  // Module components (page-level)
  'modules/page': StoryblokPage,
  'page': StoryblokPage, // Legacy support
  'modules/use-cases': StoryblokFallback, // TODO: Create use-cases component in modules/
  'modules/testimonials': StoryblokFallback, // TODO: Create testimonials component in modules/
}

/**
 * Extract component name from Storyblok component string
 * Handles both formats: 'block/hero' -> 'block/hero', 'hero' -> 'hero'
 */
const getComponentName = (componentString: string): string => {
  return componentString
}

/**
 * Find the matching Vue component
 * First tries exact match, then tries to extract the base name
 */
const findComponent = (componentString: string): any => {
  // Try exact match first
  if (componentMap[componentString]) {
    return componentMap[componentString]
  }
  
  // Try to extract base name (e.g., 'block/hero' -> 'hero')
  const parts = componentString.split('/')
  const baseName = parts[parts.length - 1]
  
  if (baseName && componentMap[baseName]) {
    return componentMap[baseName]
  }
  
  return StoryblokFallback
}

const component = computed(() => {
  return findComponent(props.blok.component)
})
</script>

