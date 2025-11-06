<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 v-if="title" class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ title }}
        </h2>
        <p v-if="description" class="text-xl text-gray-600 dark:text-gray-300">
          {{ description }}
        </p>
      </div>

      <div v-if="faqsList && faqsList.length > 0" class="space-y-4">
        <div
          v-for="(faq, index) in faqsList"
          :key="faq._uid || index"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
          :class="{
            'hover:shadow-lg': !isAccordion || openItems.has(index),
          }"
        >
          <!-- Question button -->
          <button
            v-if="isAccordion"
            type="button"
            class="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200"
            :class="{
              'bg-gray-50 dark:bg-gray-700': openItems.has(index),
              'hover:bg-gray-50 dark:hover:bg-gray-700': !openItems.has(index),
            }"
            @click="toggleItem(index)"
            @keydown.enter="toggleItem(index)"
            @keydown.space.prevent="toggleItem(index)"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white pr-4">
              {{ faq.question }}
            </h3>
            <svg
              class="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': openItems.has(index) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Question (non-accordion) -->
          <div v-else class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ faq.question }}
            </h3>
          </div>

          <!-- Answer -->
          <div
            v-if="!isAccordion || openItems.has(index)"
            class="px-6 py-5 text-gray-600 dark:text-gray-300 leading-relaxed"
            :class="{
              'border-t border-gray-200 dark:border-gray-700': !isAccordion,
            }"
          >
            <div v-if="typeof faq.answer === 'object' && faq.answer !== null">
              <StoryblokRichText :content="faq.answer" />
            </div>
            <div v-else class="prose prose-sm dark:prose-invert max-w-none">
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

