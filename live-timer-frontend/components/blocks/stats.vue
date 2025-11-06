<template>
  <section
    :class="[
      'py-20 relative overflow-hidden',
      backgroundClass
    ]"
  >
    <!-- Decorative elements for gray background -->
    <div v-if="background === 'gray'" class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
    <div v-if="background === 'gray'" class="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="title || description" class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          {{ title }}
        </h2>
        <p v-if="description" class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {{ description }}
        </p>
      </div>

      <div v-if="statsList && statsList.length > 0" :class="gridClass">
        <div
          v-for="(stat, index) in statsList"
          :key="stat._uid || index"
          class="bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 text-center group relative overflow-hidden"
        >
          <!-- Decorative accent line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <!-- Icon if available -->
          <div
            v-if="stat.icon && getImageUrl(stat.icon)"
            class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100"
          >
            <img
              :src="getImageUrl(stat.icon)"
              alt="Stat icon"
              class="w-10 h-10 object-contain"
            />
          </div>

          <!-- Stat value/text -->
          <div class="mb-3 relative z-10">
            <div
              v-if="stat.value"
              class="text-4xl md:text-5xl font-bold text-gray-900"
            >
              {{ stat.value }}
            </div>
            <div
              v-else-if="stat.stat"
              class="text-xl md:text-2xl font-semibold text-gray-900 leading-tight"
            >
              {{ formatStatText(stat.stat) }}
            </div>
          </div>

          <!-- Label if available -->
          <div v-if="stat.label" class="text-base font-medium text-gray-700 mb-2">
            {{ stat.label }}
          </div>

          <!-- Description if available -->
          <div v-if="stat.description" class="text-sm text-gray-600 leading-relaxed">
            {{ stat.description }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StatsBlock } from '~/types/storyblok'

interface Props extends Partial<StatsBlock> {
  // Props are spread from StoryblokComponent, so we extend StatsBlock directly
}

const props = defineProps<Props>()

const { getImageUrl } = useStoryblokContent()

const title = computed(() => props.title || '')
const description = computed(() => props.description || '')
const statsList = computed(() => {
  return (props.stats || []).filter(
    (item: unknown) => item && typeof item === 'object' && ('stat' in item || 'value' in item)
  )
})

const layout = computed(() => props.layout || 'grid-4')
const background = computed(() => props.background_color || 'white')

const gridClass = computed(() => {
  const classes: Record<string, string> = {
    'grid-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
    'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
    'grid-2': 'grid grid-cols-1 md:grid-cols-2 gap-6',
  }
  return classes[layout.value] || classes['grid-4']
})

const backgroundClass = computed(() => {
  const classes: Record<string, string> = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900',
    gradient: 'bg-white',
  }
  return classes[background.value] || classes.white
})

const formatStatText = (text: string): string => {
  // Handle stat text that might contain escaped quotes or special formatting
  // Example: "99.9% Uptime\" - \"Production-grade availability\""
  if (!text) return ''
  
  // Remove escaped quotes and clean up
  return text
    .replace(/\\"/g, '"')
    .replace(/"/g, '')
    .trim()
}
</script>

