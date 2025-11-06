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
  const base = 'font-semibold rounded-lg transition-all duration-200 inline-block text-center'
  
  const variants = {
    primary: 'bg-gray-900 text-white shadow-sm hover:shadow-md hover:bg-gray-800',
    secondary: 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300',
    text: 'text-gray-900 hover:text-gray-700 underline',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  }
  
  return `${base} ${variants[variant.value]} ${sizes[size.value]}`
})
</script>

