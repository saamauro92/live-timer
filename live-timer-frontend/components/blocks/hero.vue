<template>
  <section
    class="relative bg-white py-16 md:py-24 lg:py-32 overflow-hidden"
  >
    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-[0.02]">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 24px 24px;"></div>
    </div>

    <!-- Decorative gradient blobs -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div :class="heroImageUrl ? 'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center' : 'max-w-4xl mx-auto'">
        <!-- Content Column -->
        <div :class="heroImageUrl ? 'text-center lg:text-left' : 'text-center'">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {{ title }}
          </h1>
          <p v-if="subtitle || description" class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed" :class="heroImageUrl ? 'lg:mx-0' : ''">
            {{ subtitle || description }}
          </p>
          <div v-if="hasCta" class="flex flex-col sm:flex-row gap-4 justify-center items-center" :class="heroImageUrl ? 'lg:justify-start' : ''">
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
                class="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-800"
              >
                {{ cta_text }}
              </NuxtLink>
              <NuxtLink
                v-if="cta_secondary_text && !ctaSecondaryComponent"
                :to="ctaSecondaryLink"
                class="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                {{ cta_secondary_text }}
              </NuxtLink>
            </template>
          </div>
        </div>

        <!-- Image Column -->
        <div v-if="heroImageUrl" class="relative">
          <div class="relative rounded-2xl overflow-hidden bg-gray-50 p-8 shadow-lg border border-gray-100">
            <img
              :src="heroImageUrl"
              :alt="imageAlt"
              class="w-full h-auto object-contain rounded-lg"
            />
            <!-- Decorative corner accent -->
            <div class="absolute top-0 right-0 w-20 h-20 bg-gray-900 opacity-5 rounded-bl-2xl"></div>
          </div>
          <!-- Decorative element -->
          <div class="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-gray-100 rounded-2xl"></div>
          <!-- Additional decorative accent -->
          <div class="absolute -z-20 -bottom-8 -right-8 w-full h-full bg-gray-50 rounded-2xl"></div>
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

const { resolveLink, getImageUrl } = useStoryblokContent()

const title = computed(() => props.title || '')
const subtitle = computed(() => props.subtitle || '')
const description = computed(() => props.description || '')
const cta_text = computed(() => props.cta_text || '')
const cta_secondary_text = computed(() => props.cta_secondary_text || '')
const ctaLink = computed(() => props.cta_link ? resolveLink(props.cta_link) : '#')
const ctaSecondaryLink = computed(() => props.cta_secondary_link ? resolveLink(props.cta_secondary_link) : '#')

// Image handling
const heroImageUrl = computed(() => {
  if (props.image) {
    return getImageUrl(props.image, { width: 800, quality: 90 })
  }
  return ''
})

const imageAlt = computed(() => {
  return props.image?.alt || props.title || 'Hero image'
})

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



