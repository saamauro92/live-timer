<template>
  <section class="py-20 bg-white relative overflow-hidden">
    <!-- Subtle background decoration -->
    <div class="absolute top-0 left-1/4 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
    <div class="absolute bottom-0 right-1/4 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          {{ title }}
        </h2>
        <p v-if="description" class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {{ description }}
        </p>
      </div>

      <div v-if="featuresList && featuresList.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(feature, index) in featuresList"
          :key="feature._uid || index"
          class="bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
        >
          <!-- Decorative corner accent on hover -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-3xl"></div>
          
          <div
            v-if="feature.icon && getImageUrl(feature.icon)"
            class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors duration-300 relative z-10 border border-gray-100"
          >
            <img
              :src="getImageUrl(feature.icon)"
              :alt="feature.title || 'Feature icon'"
              class="w-10 h-10 object-contain"
            />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4 relative z-10">
            {{ feature.title }}
          </h3>
          <div class="text-gray-600 leading-relaxed relative z-10">
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

