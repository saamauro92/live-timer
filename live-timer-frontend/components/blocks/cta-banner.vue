<template>
  <section
    :class="[
      'py-20 md:py-28 relative overflow-hidden',
      backgroundClass
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Card container with border and shadow -->
      <div class="relative bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-12 md:p-16">
        <!-- Decorative corner elements -->
        <div class="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gray-200 rounded-tl-2xl"></div>
        <div class="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gray-200 rounded-br-2xl"></div>
        
        <div class="text-center relative z-10">
          <h2 v-if="title" class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {{ title }}
          </h2>
          <p v-if="description" class="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            {{ description }}
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
                class="px-10 py-5 bg-gray-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-800 text-lg"
              >
                {{ cta_text }}
              </NuxtLink>
              <NuxtLink
                v-if="cta_secondary_text && !ctaSecondaryComponent"
                :to="ctaSecondaryLink"
                class="px-10 py-5 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-lg"
              >
                {{ cta_secondary_text }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StoryblokComponent } from '~/types/storyblok'
import StoryblokComponentVue from '../StoryblokComponent.vue'

interface CtaBannerBlock extends StoryblokComponent {
  component: 'block/cta-banner'
  title?: string
  description?: string
  // New format: links array with Link components
  links?: StoryblokComponent[]
  // Legacy format (for backward compatibility)
  cta_text?: string
  cta_link?: {
    id?: string
    url?: string
    linktype?: string
    fieldtype?: string
    cached_url?: string
  }
  cta_secondary_text?: string
  cta_secondary_link?: {
    id?: string
    url?: string
    linktype?: string
    fieldtype?: string
    cached_url?: string
  }
  cta?: StoryblokComponent | StoryblokComponent[]
  cta_secondary?: StoryblokComponent | StoryblokComponent[]
  background_color?: 'white' | 'gray'
}

interface Props extends Partial<CtaBannerBlock> {}

const props = defineProps<Props>()

const { resolveLink } = useStoryblokContent()

const title = computed(() => props.title || '')
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
    if (Array.isArray(props.cta) && props.cta.length > 0) {
      return props.cta[0]
    }
    if (typeof props.cta === 'object' && props.cta !== null && 'component' in props.cta) {
      return props.cta
    }
  }
  return null
})

const ctaSecondaryComponent = computed(() => {
  if (props.cta_secondary) {
    if (Array.isArray(props.cta_secondary) && props.cta_secondary.length > 0) {
      return props.cta_secondary[0]
    }
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

const background = computed(() => props.background_color || 'gray')

const backgroundClass = computed(() => {
  const classes: Record<string, string> = {
    white: 'bg-white',
    gray: 'bg-gray-50',
  }
  return classes[background.value] || classes.gray
})
</script>

