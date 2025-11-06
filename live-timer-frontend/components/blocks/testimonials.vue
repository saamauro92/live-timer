<template>
  <section class="py-20 bg-gray-50 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          {{ title }}
        </h2>
        <p v-if="description" class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {{ description }}
        </p>
      </div>

      <div v-if="testimonialsList && testimonialsList.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(testimonial, index) in testimonialsList"
          :key="testimonial._uid || index"
          class="bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
        >
          <!-- Decorative quote icon -->
          <div class="absolute top-6 right-6 text-gray-100 text-5xl font-serif leading-none">
            "
          </div>
          <!-- Decorative accent on hover -->
          <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-900 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

          <!-- Rating stars -->
          <div v-if="testimonial.rating" class="flex items-center mb-5">
            <div class="flex text-amber-400">
              <svg
                v-for="i in 5"
                :key="i"
                class="w-4 h-4"
                :class="i <= Number(testimonial.rating) ? 'fill-current' : 'text-gray-200'"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>

          <!-- Quote text -->
          <blockquote class="text-gray-700 mb-6 relative z-10 leading-relaxed">
            "{{ testimonial.quote }}"
          </blockquote>

          <!-- Author info -->
          <div class="flex items-center pt-6 border-t border-gray-100">
            <div
              v-if="testimonial.image && getImageUrl(testimonial.image)"
              class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden"
            >
              <img
                :src="getImageUrl(testimonial.image)"
                :alt="testimonial.name"
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold mr-4 flex-shrink-0"
            >
              {{ testimonial.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-gray-900">
                {{ testimonial.name }}
              </div>
              <div class="text-sm text-gray-600">
                <span v-if="testimonial.role">{{ testimonial.role }}</span>
                <span v-if="testimonial.role && testimonial.company">, </span>
                <span v-if="testimonial.company">{{ testimonial.company }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TestimonialsBlock } from '~/types/storyblok'

interface Props extends Partial<TestimonialsBlock> {
  // Props are spread from StoryblokComponent, so we extend TestimonialsBlock directly
}

const props = defineProps<Props>()

const { getImageUrl } = useStoryblokContent()

const title = computed(() => props.title || '')
const description = computed(() => props.description || '')
const testimonialsList = computed(() => {
  return (props.testimonials || []).filter(
    (item: unknown) => item && typeof item === 'object' && 'quote' in item && 'name' in item
  )
})
</script>

