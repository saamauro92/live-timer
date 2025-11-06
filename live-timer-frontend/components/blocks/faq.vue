<template>
  <section class="py-20 bg-white relative overflow-hidden">
    <!-- Subtle background decoration -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          {{ title }}
        </h2>
        <p v-if="description" class="text-lg md:text-xl text-gray-600 leading-relaxed">
          {{ description }}
        </p>
      </div>

      <div v-if="faqsList && faqsList.length > 0" class="space-y-3">
        <div
          v-for="(faq, index) in faqsList"
          :key="faq._uid || index"
          class="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 group"
          :class="{
            'hover:border-gray-300': !isAccordion || openItems.has(index),
          }"
        >
          <!-- Decorative accent line -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <!-- Question button -->
          <button
            v-if="isAccordion"
            type="button"
            class="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-inset transition-colors duration-200"
            :class="{
              'bg-gray-50': openItems.has(index),
              'hover:bg-gray-50': !openItems.has(index),
            }"
            @click="toggleItem(index)"
            @keydown.enter="toggleItem(index)"
            @keydown.space.prevent="toggleItem(index)"
          >
            <h3 class="text-lg font-semibold text-gray-900 pr-4">
              {{ faq.question }}
            </h3>
            <svg
              class="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': openItems.has(index) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Question (non-accordion) -->
          <div v-else class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ faq.question }}
            </h3>
          </div>

          <!-- Answer -->
          <div
            v-if="!isAccordion || openItems.has(index)"
            class="px-6 py-5 text-gray-600 leading-relaxed"
            :class="{
              'border-t border-gray-100': !isAccordion,
            }"
          >
            <div v-if="typeof faq.answer === 'object' && faq.answer !== null">
              <StoryblokRichText :content="faq.answer" />
            </div>
            <div v-else class="prose prose-sm max-w-none">
              <p v-html="formatAnswer(faq.answer)"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FaqBlock } from '~/types/storyblok'

interface Props extends Partial<FaqBlock> {
  // Props are spread from StoryblokComponent, so we extend FaqBlock directly
}

const props = defineProps<Props>()

const title = computed(() => props.title || '')
const description = computed(() => props.description || '')
const faqsList = computed(() => {
  return (props.faqs || []).filter(
    (item: unknown) => item && typeof item === 'object' && 'question' in item && 'answer' in item
  )
})

const isAccordion = computed(() => props.layout !== 'list')
const allowMultiple = computed(() => props.allow_multiple_open ?? true)

const openItems = ref<Set<number>>(new Set())

const toggleItem = (index: number) => {
  if (!allowMultiple.value) {
    // Close all other items if only one can be open
    if (openItems.value.has(index)) {
      openItems.value.clear()
    } else {
      openItems.value.clear()
      openItems.value.add(index)
    }
  } else {
    // Toggle this item
    if (openItems.value.has(index)) {
      openItems.value.delete(index)
    } else {
      openItems.value.add(index)
    }
  }
}

const formatAnswer = (answer: string | unknown): string => {
  if (typeof answer !== 'string') return ''
  
  // Convert markdown-style formatting to HTML
  let formatted = answer
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle **A**: pattern (common in FAQ answers)
    .replace(/\*\*([A-Z])\*\*:\s*/g, '<strong>$1:</strong> ')
    // Handle line breaks
    .replace(/\n/g, '<br />')
    // Clean up escaped quotes
    .replace(/\\"/g, '"')
  
  return formatted
}
</script>

