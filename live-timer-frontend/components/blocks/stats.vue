<template>
  <section
    :class="[
      'py-20',
      backgroundClass
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="title || description" class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ title }}
        </h2>
        <p v-if="description" class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {{ description }}
        </p>
      </div>

      <div v-if="statsList && statsList.length > 0" :class="gridClass">
        <div
          v-for="(stat, index) in statsList"
          :key="stat._uid || index"
          class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 text-center group"
        >
          <!-- Icon if available -->
          <div
            v-if="stat.icon && getImageUrl(stat.icon)"
            class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300"
          >
            <img
              :src="getImageUrl(stat.icon)"
              alt="Stat icon"
              class="w-10 h-10 object-contain filter brightness-0 invert"
            />
          </div>

          <!-- Stat value/text -->
          <div class="mb-2">
            <div
              v-if="stat.value"
              class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              {{ stat.value }}
            </div>
            <div
              v-else-if="stat.stat"
              class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              {{ formatStatText(stat.stat) }}
            </div>
          </div>

          <!-- Label if available -->
          <div v-if="stat.label" class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {{ stat.label }}
          </div>

          <!-- Description if available -->
          <div v-if="stat.description" class="text-sm text-gray-600 dark:text-gray-400">
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
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800',
    dark: 'bg-gray-900 dark:bg-black',
    gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
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

