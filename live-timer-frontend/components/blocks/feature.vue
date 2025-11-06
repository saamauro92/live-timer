<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ title }}
        </h2>
        <p v-if="description" class="text-xl text-gray-600 dark:text-gray-300">
          {{ description }}
        </p>
      </div>

      <div v-if="featuresList && featuresList.length > 0" class="grid md:grid-cols-3 gap-8">
        <div
          v-for="(feature, index) in featuresList"
          :key="feature._uid || index"
          class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div
            v-if="feature.icon && getImageUrl(feature.icon)"
            class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <img
              :src="getImageUrl(feature.icon)"
              :alt="feature.title || 'Feature icon'"
              class="w-8 h-8 object-contain"
            />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            {{ feature.title }}
          </h3>
          <div class="text-gray-600 dark:text-gray-300 text-center">
            <StoryblokRichText
              v-if="typeof feature.description === 'object' && feature.description !== null"
              :content="feature.description"
            />
            <p v-else>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FeatureBlock } from '~/types/storyblok'

interface Props extends Partial<FeatureBlock> {
  // Props are spread from StoryblokComponent, so we extend FeatureBlock directly
}

const props = defineProps<Props>()

const { getImageUrl } = useStoryblokContent()

const title = computed(() => props.title || '')
const description = computed(() => props.description || '')
const featuresList = computed(() => {
  // Support both 'feature' and 'features' array names
  return (props.features || props.feature || []).filter(
    (item: unknown) => item && typeof item === 'object' && 'title' in item
  )
})
</script>

