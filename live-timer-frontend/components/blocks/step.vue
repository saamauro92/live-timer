<template>
  <section class="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {{ title }}
        </h2>
        <p v-if="description" class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ description }}
        </p>
      </div>

      <div v-if="stepsList && stepsList.length > 0" class="relative">
        <!-- Connection line for desktop -->
        <div
          v-if="stepsList.length > 1"
          class="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          style="width: calc(100% - 200px); left: 100px;"
        />

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          <div
            v-for="(step, index) in stepsList"
            :key="step._uid || index"
            class="relative"
          >
            <!-- Step number badge -->
            <div class="flex flex-col items-center">
              <div
                class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-6 relative z-10 border-4 border-white dark:border-gray-800"
              >
                {{ index + 1 }}
              </div>

              <!-- Step content card -->
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 text-center h-full">
                <div
                  v-if="step.icon && getImageUrl(step.icon)"
                  class="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center mx-auto mb-4"
                >
                  <img
                    :src="getImageUrl(step.icon)"
                    :alt="step.title || 'Step icon'"
                    class="w-10 h-10 object-contain"
                  />
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {{ step.title }}
                </h3>
                <div class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  <StoryblokRichText
                    v-if="typeof step.description === 'object' && step.description !== null"
                    :content="step.description"
                  />
                  <p v-else>{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StepBlock } from '~/types/storyblok'

interface Props extends Partial<StepBlock> {
  // Props are spread from StoryblokComponent, so we extend StepBlock directly
}

const props = defineProps<Props>()

const { getImageUrl } = useStoryblokContent()

const title = computed(() => props.title || '')
const description = computed(() => props.description || '')
const stepsList = computed(() => {
  return (props.steps || []).filter(
    (item: unknown) => item && typeof item === 'object' && 'title' in item && 'description' in item
  )
})
</script>

