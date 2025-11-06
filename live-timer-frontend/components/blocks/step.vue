<template>
  <section class="py-20 bg-white relative overflow-hidden">
    <!-- Subtle background decoration -->
    <div class="absolute top-1/2 left-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2"></div>
    <div class="absolute top-1/2 right-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          {{ title }}
        </h2>
        <p v-if="description" class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {{ description }}
        </p>
      </div>

      <div v-if="stepsList && stepsList.length > 0" class="relative">
        <!-- Connection line for desktop with decorative dots -->
        <div
          v-if="stepsList.length > 1"
          class="hidden lg:block absolute top-20 left-0 right-0"
          style="width: calc(100% - 200px); left: 100px;"
        >
          <div class="h-px bg-gray-200 relative">
            <!-- Decorative dots along the line -->
            <div
              v-for="i in stepsList.length - 1"
              :key="i"
              class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"
              :style="`left: ${(i / stepsList.length) * 100}%`"
            ></div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          <div
            v-for="(step, index) in stepsList"
            :key="step._uid || index"
            class="relative"
          >
            <!-- Step number badge -->
            <div class="flex flex-col items-center">
              <div
                class="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10 border-4 border-white shadow-lg"
              >
                {{ index + 1 }}
                <!-- Decorative ring -->
                <div class="absolute inset-0 rounded-full border-2 border-gray-900 opacity-10"></div>
              </div>

              <!-- Step content card -->
              <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 text-center h-full hover:shadow-lg group relative overflow-hidden">
                <!-- Decorative corner accent -->
                <div class="absolute top-0 right-0 w-16 h-16 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-xl"></div>
                <div
                  v-if="step.icon && getImageUrl(step.icon)"
                  class="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-100 relative z-10"
                >
                  <img
                    :src="getImageUrl(step.icon)"
                    :alt="step.title || 'Step icon'"
                    class="w-8 h-8 object-contain"
                  />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3 relative z-10">
                  {{ step.title }}
                </h3>
                <div class="text-gray-600 text-sm leading-relaxed relative z-10">
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

