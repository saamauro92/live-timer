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
          :key="index"
          class="card p-8 text-center"
        >
          <div
            v-if="feature.icon"
            class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4"
          >
            <img
              :src="getImageUrl(feature.icon)"
              :alt="feature.title || 'Feature icon'"
              class="w-6 h-6"
            />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FeatureBlock } from '~/types/storyblok'

interface Props {
  blok: FeatureBlock
}

const props = defineProps<Props>()

const { getImageUrl } = useStoryblokContent()

const title = computed(() => props.blok.title || '')
const description = computed(() => props.blok.description || '')
const featuresList = computed(() => props.blok.features || [])
</script>

