<template>
  <section
    class="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 md:py-32 overflow-hidden"
  >
    <!-- Decorative background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {{ title }}
          </span>
        </h1>
        <p v-if="subtitle || description" class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          {{ subtitle || description }}
        </p>
        <div v-if="hasCta" class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <!-- New format: links array -->
          <template v-if="linksArray && linksArray.length > 0">
            <StoryblokComponentVue
              v-for="(linkItem, index) in linksArray"
              :key="linkItem._uid || index"
              :blok="linkItem as unknown as StoryblokComponent"
            />
          </template>
          
          <!-- Legacy format: nested cta components -->
          <template v-else>
            <StoryblokComponentVue
              v-if="ctaComponent"
              :blok="ctaComponent as unknown as StoryblokComponent"
            />
            <StoryblokComponentVue
              v-if="ctaSecondaryComponent"
              :blok="ctaSecondaryComponent as unknown as StoryblokComponent"
            />
            
            <!-- Legacy format: cta_text/cta_link -->
            <NuxtLink
              v-if="cta_text && !ctaComponent"
              :to="ctaLink"
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {{ cta_text }}
            </NuxtLink>
            <NuxtLink
              v-if="cta_secondary_text && !ctaSecondaryComponent"
              :to="ctaSecondaryLink"
              class="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
            >
              {{ cta_secondary_text }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroBlock, StoryblokComponent } from '~/types/storyblok'
import StoryblokComponentVue from '../StoryblokComponent.vue'

interface Props extends Partial<HeroBlock> {
  // Props are spread from StoryblokComponent, so we extend HeroBlock directly
}

const props = defineProps<Props>()

const { resolveLink } = useStoryblokContent()

const title = computed(() => props.title || '')
const subtitle = computed(() => props.subtitle || '')
const description = computed(() => props.description || '')
const cta_text = computed(() => props.cta_text || '')
const cta_secondary_text = computed(() => props.cta_secondary_text || '')
const ctaLink = computed(() => props.cta_link ? resolveLink(props.cta_link) : '#')
const ctaSecondaryLink = computed(() => props.cta_secondary_link ? resolveLink(props.cta_secondary_link) : '#')

// Handle new format: links array (primary format)
const linksArray = computed(() => {
  if (props.links && Array.isArray(props.links) && props.links.length > 0) {
    return props.links.filter(
      (item: unknown) => item && typeof item === 'object' && 'component' in item
    ) as StoryblokComponent[]
  }
  return []
})

// Handle legacy format: nested cta components
const ctaComponent = computed(() => {
  if (props.cta) {
    // If it's an array, take the first item
    if (Array.isArray(props.cta) && props.cta.length > 0) {
      return props.cta[0]
    }
    // If it's a single component
    if (typeof props.cta === 'object' && props.cta !== null && 'component' in props.cta) {
      return props.cta
    }
  }
  return null
})

const ctaSecondaryComponent = computed(() => {
  if (props.cta_secondary) {
    // If it's an array, take the first item
    if (Array.isArray(props.cta_secondary) && props.cta_secondary.length > 0) {
      return props.cta_secondary[0]
    }
    // If it's a single component
    if (typeof props.cta_secondary === 'object' && props.cta_secondary !== null && 'component' in props.cta_secondary) {
      return props.cta_secondary
    }
  }
  return null
})

const hasCta = computed(() => {
  return !!(
    linksArray.value.length > 0 ||
    ctaComponent.value ||
    cta_text.value ||
    ctaSecondaryComponent.value ||
    cta_secondary_text.value
  )
})
</script>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>


