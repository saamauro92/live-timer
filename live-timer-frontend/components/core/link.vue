<template>
  <NuxtLink
    v-if="linkUrl"
    :to="linkUrl"
    :target="target"
    :class="linkClasses"
  >
    {{ label }}
  </NuxtLink>
  <span v-else-if="label" :class="linkClasses">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { StoryblokLink } from '~/types/storyblok'

interface Props {
  // Props are spread from StoryblokComponent
  _uid?: string
  _editable?: string
  component?: string
  label?: string
  link?: StoryblokLink | string
  variant?: "primary" | "secondary" | "text"
  size?: "sm" | "md" | "lg"
  target?: string
  type?: string
}

const props = defineProps<Props>()

// Default values
const label = computed(() => props.label || '')
const variant = computed(() => props.variant || 'primary')
const size = computed(() => props.size || 'md')
const target = computed(() => props.target || '_self')

const { resolveLink } = useStoryblokContent()

const linkUrl = computed(() => {
  if (!props.link) return ''
  return resolveLink(props.link)
})

const linkClasses = computed(() => {
  const base = 'font-semibold rounded-xl transition-all duration-200 inline-block text-center'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500',
    text: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4',
    lg: 'px-10 py-5 text-lg',
  }
  
  return `${base} ${variants[variant.value]} ${sizes[size.value]}`
})
</script>

